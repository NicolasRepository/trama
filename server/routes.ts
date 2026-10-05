import crypto from 'node:crypto';
import path from 'node:path';
import { Router } from 'express';
import { execute, query } from './db.js';
import { completeLogin, logout, requireAdmin, requireUser, startLogin, userFromRequest } from './auth.js';

export const router = Router();
const statuses = ['Rascunho', 'Aguardando aprovação', 'Aprovado', 'Alteração solicitada', 'Reenviado para aprovação', 'Publicado'] as const;
const maxUploadBytes = 50 * 1024 * 1024;

function input(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}
function numberInput(value: unknown): number | null {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}
function fail(message: string, status = 400): never {
  throw Object.assign(new Error(message), { status });
}
async function historyFor(contentId: number) {
  return query(`SELECT r.id, r.request_number AS requestNumber, r.message, r.created_at AS createdAt, u.name AS requestedBy
    FROM portal_change_requests r JOIN portal_users u ON u.id = r.user_id
    WHERE r.content_id = ? ORDER BY r.request_number ASC`, [contentId]);
}
async function contentWithHistory(row: any) {
  return { ...row, id: Number(row.id), clientId: Number(row.clientId), alterationCount: Number(row.alterationCount), history: await historyFor(Number(row.id)) };
}
async function contentRows(where = '', params: unknown[] = []) {
  const rows = await query(`SELECT c.id, c.client_id AS clientId, cl.company_name AS clientName, c.title, c.caption, c.publish_date AS publishDate,
      c.content_type AS contentType, c.asset_key AS assetKey, c.asset_url AS assetUrl, c.status,
      c.alteration_count AS alterationCount, c.created_at AS createdAt, c.updated_at AS updatedAt
    FROM portal_contents c JOIN portal_clients cl ON cl.id = c.client_id ${where} ORDER BY c.updated_at DESC`, params);
  return Promise.all(rows.map(contentWithHistory));
}

router.get('/health', (_request, response) => response.json({ ok: true, service: 'portal-trama' }));
router.get('/auth/me', async (request, response) => response.json({ user: await userFromRequest(request) }));
router.get('/auth/login', (request, response) => startLogin(request, response));
router.get('/auth/callback', async (request, response) => completeLogin(request, response));
router.get('/auth/logout', async (request, response) => logout(request, response));

router.get('/admin/summary', async (request, response) => {
  await requireAdmin(request);
  const rows = await query<{ status: string; count: number }>('SELECT status, COUNT(*) AS count FROM portal_contents GROUP BY status');
  const totals = Object.fromEntries(rows.map((row) => [row.status, Number(row.count)]));
  const changes = await query<{ count: number }>('SELECT COUNT(*) AS count FROM portal_change_requests');
  response.json({ summary: { waiting: totals['Aguardando aprovação'] ?? 0, approved: totals.Aprovado ?? 0, requested: totals['Alteração solicitada'] ?? 0, published: totals.Publicado ?? 0, changes: Number(changes[0]?.count ?? 0) } });
});

router.get('/admin/clients', async (request, response) => {
  await requireAdmin(request);
  const rows = await query('SELECT id, company_name AS companyName, contact_name AS contactName, email, created_at AS createdAt FROM portal_clients ORDER BY company_name ASC');
  response.json({ clients: rows.map((row: any) => ({ ...row, id: Number(row.id) })) });
});

router.post('/admin/clients', async (request, response) => {
  await requireAdmin(request);
  const companyName = input(request.body?.companyName);
  const contactName = input(request.body?.contactName);
  const email = input(request.body?.email).toLowerCase();
  if (!companyName || !contactName || !email || !email.includes('@')) fail('Preencha empresa, responsável e e-mail.');
  const result = await execute('INSERT INTO portal_clients (company_name, contact_name, email) VALUES (?, ?, ?)', [companyName, contactName, email]);
  response.status(201).json({ client: { id: Number(result.insertId), companyName, contactName, email } });
});

router.get('/admin/contents', async (request, response) => {
  await requireAdmin(request);
  const conditions: string[] = [];
  const params: unknown[] = [];
  const status = input(request.query.status);
  const clientId = numberInput(request.query.clientId);
  if (status) { conditions.push('c.status = ?'); params.push(status); }
  if (clientId) { conditions.push('c.client_id = ?'); params.push(clientId); }
  const result = await contentRows(conditions.length ? `WHERE ${conditions.join(' AND ')}` : '', params);
  response.json({ contents: result });
});

router.post('/admin/contents', async (request, response) => {
  const admin = await requireAdmin(request);
  const clientId = numberInput(request.body?.clientId);
  const title = input(request.body?.title);
  const caption = input(request.body?.caption);
  const contentType = input(request.body?.contentType) || 'image';
  const publishDate = input(request.body?.publishDate) || null;
  const assetKey = input(request.body?.assetKey) || null;
  const assetUrl = input(request.body?.assetUrl) || null;
  const status = statuses.includes(request.body?.status) ? request.body.status : 'Rascunho';
  if (!clientId || !title || !caption) fail('Cliente, título e legenda são obrigatórios.');
  const client = await query<{ id: number }>('SELECT id FROM portal_clients WHERE id = ?', [clientId]);
  if (!client[0]) fail('Cliente não encontrado.', 404);
  const result = await execute(`INSERT INTO portal_contents (client_id, title, caption, publish_date, content_type, asset_key, asset_url, status, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [clientId, title, caption, publishDate, contentType, assetKey, assetUrl, status, admin.id]);
  response.status(201).json({ content: { id: Number(result.insertId) } });
});

router.patch('/admin/contents/:id', async (request, response) => {
  await requireAdmin(request);
  const id = numberInput(request.params.id);
  const status = input(request.body?.status);
  if (!id || !statuses.includes(status as typeof statuses[number])) fail('Status inválido.');
  await execute('UPDATE portal_contents SET status = ? WHERE id = ?', [status, id]);
  response.json({ ok: true });
});

router.post('/uploads/presign', async (request, response) => {
  await requireAdmin(request);
  const clientId = numberInput(request.body?.clientId);
  const filename = input(request.body?.filename);
  const contentType = input(request.body?.contentType);
  const size = Number(request.body?.size);
  if (!clientId || !filename || !contentType || !Number.isFinite(size) || size <= 0 || size > maxUploadBytes) fail('Arquivo inválido ou maior que 50 MB.');
  const allowed = /^image\/(png|jpeg|webp|gif)|video\/(mp4|webm|quicktime)$/i;
  if (!allowed.test(contentType)) fail('Use uma imagem PNG, JPG, WEBP ou um vídeo MP4, WEBM ou MOV.');
  const client = await query<{ id: number }>('SELECT id FROM portal_clients WHERE id = ?', [clientId]);
  if (!client[0]) fail('Cliente não encontrado.', 404);
  const base = path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, '-').slice(-100);
  const key = `portal/${clientId}/${Date.now()}-${crypto.randomBytes(8).toString('hex')}-${base}`;
  const apiUrl = process.env.MANUS_API_URL;
  const apiKey = process.env.MANUS_API_KEY;
  if (!apiUrl || !apiKey) fail('Storage do projeto não está configurado.', 503);
  const presign = await fetch(`${apiUrl}/v1/storage/presign/put?path=${encodeURIComponent(key)}`, { headers: { Authorization: `Bearer ${apiKey}` } });
  const body = await presign.json() as { url?: string; error?: string };
  if (!presign.ok || !body.url) fail(body.error || 'Não foi possível preparar o upload.', 502);
  response.json({ uploadUrl: body.url, assetKey: key, assetUrl: `/manus-storage/${key}`, contentType, maxBytes: maxUploadBytes });
});

router.get('/client/contents', async (request, response) => {
  const user = await requireUser(request);
  if (user.role !== 'client' || !user.clientId) fail('Acesso de cliente não configurado.', 403);
  const status = input(request.query.status);
  const conditions = ['c.client_id = ?'];
  const params: unknown[] = [user.clientId];
  if (status) { conditions.push('c.status = ?'); params.push(status); }
  response.json({ contents: await contentRows(`WHERE ${conditions.join(' AND ')}`, params) });
});

async function ownContent(user: Awaited<ReturnType<typeof requireUser>>, id: number) {
  if (user.role !== 'client' || !user.clientId) fail('Acesso de cliente não configurado.', 403);
  const rows = await query<{ id: number; client_id: number }>('SELECT id, client_id FROM portal_contents WHERE id = ? AND client_id = ?', [id, user.clientId]);
  if (!rows[0]) fail('Conteúdo não encontrado.', 404);
  return rows[0];
}

router.post('/client/contents/:id/approve', async (request, response) => {
  const user = await requireUser(request);
  const id = numberInput(request.params.id);
  if (!id) fail('Conteúdo inválido.');
  await ownContent(user, id);
  await execute('UPDATE portal_contents SET status = ? WHERE id = ?', ['Aprovado', id]);
  response.json({ ok: true, status: 'Aprovado' });
});

router.post('/client/contents/:id/changes', async (request, response) => {
  const user = await requireUser(request);
  const id = numberInput(request.params.id);
  const message = input(request.body?.message);
  if (!id || !message) fail('Escreva o que gostaria de alterar.');
  await ownContent(user, id);
  const rows = await query<{ alterationCount: number }>('SELECT alteration_count AS alterationCount FROM portal_contents WHERE id = ?', [id]);
  const number = Number(rows[0]?.alterationCount ?? 0) + 1;
  await execute('INSERT INTO portal_change_requests (content_id, user_id, request_number, message) VALUES (?, ?, ?, ?)', [id, user.id, number, message]);
  await execute('UPDATE portal_contents SET alteration_count = ?, status = ? WHERE id = ?', [number, 'Alteração solicitada', id]);
  response.status(201).json({ ok: true, status: 'Alteração solicitada', alterationCount: number });
});

export { statuses };
