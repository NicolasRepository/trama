import './styles.css';

type User = { id: number; name: string; email: string; role: 'admin' | 'client'; clientId: number | null };
type Client = { id: number; companyName: string; contactName: string; email: string };
type ChangeRequest = { id: number; requestNumber: number; message: string; createdAt: string; requestedBy: string };
type Content = {
  id: number; clientId: number; clientName: string; title: string; caption: string; publishDate: string | null;
  contentType: string; assetUrl: string | null; status: string; alterationCount: number; history: ChangeRequest[];
};
type Summary = { waiting: number; approved: number; requested: number; published: number; changes: number };

const portalRoot = document.querySelector<HTMLDivElement>('#portal-app');
if (!portalRoot) throw new Error('Portal root not found');
const root: HTMLDivElement = portalRoot;

const state: { user: User | null; clients: Client[]; contents: Content[]; summary: Summary | null; filterStatus: string; filterClient: string; clientTab: string; adminClientTab: string; modal: string | null } = {
  user: null, clients: [], contents: [], summary: null, filterStatus: '', filterClient: '', clientTab: 'Aguardando aprovação', adminClientTab: 'Conteúdos', modal: null,
};

function esc(value: unknown): string {
  return String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char] ?? char));
}
function date(value: string | null): string { return value ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(new Date(`${value}T12:00:00`)) : 'Sem data'; }
function time(value: string): string { return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value)); }
function statusClass(status: string): string { return `status status--${status.toLowerCase().replace(/[^a-záéíóúãõç]+/g, '-').replace(/-+$/g, '')}`; }
function arrow(): string { return '<span aria-hidden="true">↗</span>'; }

async function api<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, { ...options, headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || 'Não foi possível concluir a ação.');
  return body as T;
}

function shell(content: string, title: string): string {
  const user = state.user!;
  return `<div class="portal-shell">
    <aside class="portal-sidebar">
      <a class="portal-brand" href="/portal" aria-label="Portal TRAMA"><img src="${import.meta.env.BASE_URL}logo-abrev.png" alt="TRAMA" /><span>Portal TRAMA</span></a>
      <div class="portal-side-line"></div>
      <p class="portal-kicker">${user.role === 'admin' ? 'área TRAMA' : 'área do cliente'}</p>
      <div class="portal-profile"><strong>${esc(user.name)}</strong><span>${esc(user.email)}</span></div>
      ${user.role === 'admin' ? clientMenu() : ''}
      <div class="portal-thread" aria-hidden="true"><span></span><span></span><span></span></div>
      <a class="portal-logout" href="/api/auth/logout">Sair ${arrow()}</a>
    </aside>
    <main class="portal-main">
      <header class="portal-topbar"><div><span class="portal-eyebrow">${user.role === 'admin' ? 'controle de aprovações' : 'conteúdos da sua marca'}</span><h1>${title}</h1></div><span class="portal-mark">uma linha. muitas possibilidades.</span></header>
      ${content}
    </main>
  </div>`;
}

function clientMenu(): string {
  return `<nav class="client-menu" aria-label="Clientes"><span class="client-menu__label">Clientes</span><button class="client-nav-item ${state.filterClient ? '' : 'is-active'}" data-clear-client>Todos os clientes</button>${state.clients.map((client) => `<button class="client-nav-item ${state.filterClient === String(client.id) ? 'is-active' : ''}" data-client-id="${client.id}">${esc(client.companyName)}</button>`).join('')}</nav>`;
}

function loginView(message = ''): void {
  root.innerHTML = `<main class="login-screen"><div class="login-card"><div class="login-line"></div><img src="${import.meta.env.BASE_URL}logotrama.png" alt="TRAMA" class="login-logo" /><span class="portal-eyebrow">portal de aprovações</span><h1>O fio está aqui.<br /><em>Vamos organizar.</em></h1><p>Um espaço simples para a TRAMA e seus clientes aprovarem conteúdos, registrarem alterações e manterem tudo conectado.</p>${message ? `<div class="portal-alert">${esc(message)}</div>` : ''}<a class="portal-button portal-button--wine" href="/api/auth/login?origin=${encodeURIComponent(window.location.origin)}">Entrar com Manus ${arrow()}</a><small>O acesso é feito pela autenticação segura do projeto.</small></div><div class="login-thread" aria-hidden="true"></div></main>`;
}

function media(content: Content): string {
  if (!content.assetUrl) return '<div class="content-media content-media--empty"><span>arquivo ainda não enviado</span></div>';
  if (content.contentType.startsWith('video')) return `<video class="content-media" controls preload="metadata" src="${esc(content.assetUrl)}"></video>`;
  return `<img class="content-media" src="${esc(content.assetUrl)}" alt="${esc(content.title)}" loading="lazy" />`;
}
function history(content: Content): string {
  if (!content.history?.length) return '<p class="history-empty">Nenhuma alteração registrada.</p>';
  return `<ol class="history-list">${content.history.map((item) => `<li><span>Alteração ${item.requestNumber}</span><p>“${esc(item.message)}”</p><small>${esc(item.requestedBy)} · ${time(item.createdAt)}</small></li>`).join('')}</ol>`;
}
function contentCard(content: Content, admin = false): string {
  const canApprove = !admin && ['Aguardando aprovação', 'Reenviado para aprovação'].includes(content.status);
  return `<article class="content-card">
    <div class="content-card__media">${media(content)}<span class="content-card__type">${esc(content.contentType === 'video' ? 'vídeo' : 'imagem')}</span></div>
    <div class="content-card__body"><div class="content-card__heading"><div><span class="portal-eyebrow">${admin ? esc(content.clientName) : 'conteúdo para aprovação'}</span><h3>${esc(content.title)}</h3></div><span class="${statusClass(content.status)}">${esc(content.status)}</span></div>
      <p class="content-caption">${esc(content.caption)}</p>
      <div class="content-meta"><span>Publicação: <strong>${date(content.publishDate)}</strong></span><span>Alterações solicitadas: <strong>${content.alterationCount}</strong></span></div>
      ${content.history?.length ? `<details class="history"><summary>Ver histórico (${content.history.length})</summary>${history(content)}</details>` : ''}
      ${admin ? `<div class="content-actions"><label class="inline-field">Status <select data-status-id="${content.id}"><option value="">Atual: ${esc(content.status)}</option>${['Rascunho', 'Aguardando aprovação', 'Reenviado para aprovação', 'Aprovado', 'Publicado', 'Alteração solicitada'].filter((item) => item !== content.status).map((item) => `<option value="${item}">${item}</option>`).join('')}</select></label></div>` : canApprove ? `<div class="content-actions"><button class="portal-button portal-button--wine" data-approve="${content.id}">APROVAR ${arrow()}</button><button class="portal-button portal-button--outline" data-change="${content.id}">SOLICITAR ALTERAÇÃO</button></div>` : ''}
    </div>
  </article>`;
}

function emptyState(text: string): string { return `<div class="empty-state"><span class="empty-state__dot"></span><h3>${text}</h3><p>Quando houver um novo movimento, ele aparece aqui.</p></div>`; }

function adminView(): void {
  const contents = state.contents;
  const selectedClient = state.clients.find((client) => String(client.id) === state.filterClient);
  const tabContents = state.adminClientTab === 'Aprovações' ? contents.filter((content) => ['Aguardando aprovação', 'Reenviado para aprovação'].includes(content.status)) : state.adminClientTab === 'Alterações' ? contents.filter((content) => content.status === 'Alteração solicitada') : state.adminClientTab === 'Histórico' ? contents.filter((content) => content.history?.length) : contents;
  const grid = tabContents.length ? tabContents.map((content) => contentCard(content, true)).join('') : emptyState(selectedClient ? 'Nenhum conteúdo nesta área.' : 'Nenhum conteúdo encontrado.');
  const profile = selectedClient ? `<section class="client-admin-profile"><div><span class="portal-eyebrow">perfil administrativo</span><h2>${esc(selectedClient.companyName)}</h2><p>${esc(selectedClient.contactName)} · ${esc(selectedClient.email)}</p></div><button class="portal-button portal-button--wine" data-modal="content" data-client-id="${selectedClient.id}">+ Novo conteúdo ${arrow()}</button></section><nav class="admin-tabs" aria-label="Área do cliente">${['Conteúdos', 'Aprovações', 'Alterações', 'Histórico'].map((tab) => `<button class="${state.adminClientTab === tab ? 'is-active' : ''}" data-admin-tab="${tab}">${tab}</button>`).join('')}</nav>` : '';
  root.innerHTML = shell(`<section class="portal-section"><div class="summary-grid"><div class="summary-card summary-card--accent"><span>Aguardando aprovação</span><strong>${state.summary?.waiting ?? 0}</strong></div><div class="summary-card"><span>Aprovados</span><strong>${state.summary?.approved ?? 0}</strong></div><div class="summary-card"><span>Alterações solicitadas</span><strong>${state.summary?.requested ?? 0}</strong></div><div class="summary-card"><span>Publicados</span><strong>${state.summary?.published ?? 0}</strong></div><div class="summary-card summary-card--dark"><span>Total de solicitações</span><strong>${state.summary?.changes ?? 0}</strong></div></div>
    ${profile}<div class="portal-toolbar"><div class="toolbar-filters"><select data-filter-status><option value="">Todos os status</option>${['Rascunho', 'Aguardando aprovação', 'Aprovado', 'Alteração solicitada', 'Reenviado para aprovação', 'Publicado'].map((item) => `<option ${state.filterStatus === item ? 'selected' : ''}>${item}</option>`).join('')}</select><select data-filter-client><option value="">Todos os clientes</option>${state.clients.map((client) => `<option value="${client.id}" ${state.filterClient === String(client.id) ? 'selected' : ''}>${esc(client.companyName)}</option>`).join('')}</select></div><div class="toolbar-actions"><button class="portal-button portal-button--outline" data-modal="client">+ Novo cliente</button><button class="portal-button portal-button--wine" data-modal="content" ${selectedClient ? `data-client-id="${selectedClient.id}"` : ''}>+ Novo conteúdo ${arrow()}</button></div></div>
    <div class="portal-section-heading"><div><span class="portal-eyebrow">${selectedClient ? 'perfil do cliente' : 'visão geral'}</span><h2>${selectedClient ? esc(selectedClient.companyName) : 'Conteúdos em movimento.'}</h2></div><span class="portal-count">${tabContents.length} item(ns)</span></div><div class="content-grid">${grid}</div></section>${modalMarkup()}`, selectedClient ? selectedClient.companyName : 'Painel administrativo.');
}

function clientView(): void {
  const tabs = ['Aguardando aprovação', 'Aprovado', 'Alteração solicitada'];
  const filtered = state.contents.filter((content) => state.clientTab === 'Aguardando aprovação' ? ['Aguardando aprovação', 'Reenviado para aprovação'].includes(content.status) : content.status === state.clientTab);
  root.innerHTML = shell(`<section class="portal-section"><div class="client-intro"><div><span class="portal-eyebrow">seu espaço de aprovação</span><h2>O que precisa<br /><em>da sua aprovação?</em></h2></div><div class="client-intro__thread"><span></span><span></span><span></span></div></div><nav class="portal-tabs" aria-label="Filtrar conteúdos">${tabs.map((tab) => `<button class="${state.clientTab === tab ? 'is-active' : ''}" data-client-tab="${tab}">${tab}<span>${state.contents.filter((content) => tab === 'Aguardando aprovação' ? ['Aguardando aprovação', 'Reenviado para aprovação'].includes(content.status) : content.status === tab).length}</span></button>`).join('')}</nav><div class="content-grid">${filtered.length ? filtered.map((content) => contentCard(content)).join('') : emptyState(state.clientTab === 'Aguardando aprovação' ? 'Tudo aprovado por enquanto.' : 'Nenhum conteúdo nesta categoria.')}</div></section>${changeModalMarkup()}`, 'Seu painel.');
}

function modalMarkup(): string {
  return `<div class="portal-modal ${state.modal === 'client' ? 'is-open' : ''}" data-modal-shell="client"><div class="modal-card"><button class="modal-close" data-close-modal>×</button><span class="portal-eyebrow">novo acesso</span><h2>Cadastrar cliente.</h2><p>Depois do cadastro, o cliente poderá entrar com o mesmo e-mail no acesso Manus.</p><form data-client-form><label>Empresa/cliente<input name="companyName" required placeholder="Nome da marca" /></label><label>Responsável<input name="contactName" required placeholder="Nome da pessoa" /></label><label>E-mail de acesso<input name="email" type="email" required placeholder="cliente@empresa.com" /></label><button class="portal-button portal-button--wine" type="submit">Salvar cliente ${arrow()}</button></form></div></div><div class="portal-modal ${state.modal === 'content' ? 'is-open' : ''}" data-modal-shell="content"><div class="modal-card modal-card--wide"><button class="modal-close" data-close-modal>×</button><span class="portal-eyebrow">novo envio</span><h2>Tramar conteúdo.</h2><form data-content-form><div class="form-grid"><label>Cliente<select name="clientId" required><option value="">Selecionar cliente</option>${state.clients.map((client) => `<option value="${client.id}" ${state.filterClient === String(client.id) ? 'selected' : ''}>${esc(client.companyName)}</option>`).join('')}</select></label><label>Tipo<select name="contentType"><option value="image">Imagem</option><option value="video">Vídeo</option></select></label><label>Título/nome<input name="title" required placeholder="Ex.: Post campanha de outubro" /></label><label>Data prevista<input name="publishDate" type="date" /></label></div><label>Legenda<textarea name="caption" required placeholder="Escreva a legenda ou orientação para o cliente."></textarea></label><label class="file-drop">Arquivo de imagem ou vídeo<input name="file" type="file" accept="image/png,image/jpeg,image/webp,image/gif,video/mp4,video/webm,video/quicktime" required /><span data-file-name>Escolher arquivo · até 50 MB</span></label><button class="portal-button portal-button--wine" type="submit">Enviar para aprovação ${arrow()}</button></form></div></div>`;
}
function changeModalMarkup(): string { return `<div class="portal-modal ${state.modal?.startsWith('change:') ? 'is-open' : ''}" data-modal-shell="change"><div class="modal-card"><button class="modal-close" data-close-modal>×</button><span class="portal-eyebrow">sua observação</span><h2>O que você gostaria de alterar?</h2><form data-change-form><textarea name="message" required placeholder="Descreva o que precisa mudar neste conteúdo."></textarea><button class="portal-button portal-button--wine" type="submit">Enviar solicitação ${arrow()}</button></form></div></div>`; }

async function loadAdmin(): Promise<void> {
  const [summary, clients, contents] = await Promise.all([api<{ summary: Summary }>('/api/admin/summary'), api<{ clients: Client[] }>('/api/admin/clients'), api<{ contents: Content[] }>(`/api/admin/contents?status=${encodeURIComponent(state.filterStatus)}&clientId=${encodeURIComponent(state.filterClient)}`)]);
  state.summary = summary.summary; state.clients = clients.clients; state.contents = contents.contents; adminView();
}
async function loadClient(): Promise<void> { const result = await api<{ contents: Content[] }>('/api/client/contents'); state.contents = result.contents; clientView(); }
async function refresh(): Promise<void> { if (state.user?.role === 'admin') await loadAdmin(); else if (state.user) await loadClient(); }

async function submitClient(form: HTMLFormElement): Promise<void> { const data = new FormData(form); const payload = { companyName: String(data.get('companyName') ?? ''), contactName: String(data.get('contactName') ?? ''), email: String(data.get('email') ?? '') }; await api('/api/admin/clients', { method: 'POST', body: JSON.stringify(payload) }); state.modal = null; await loadAdmin(); }
async function submitContent(form: HTMLFormElement): Promise<void> {
  const data = new FormData(form); const file = data.get('file') as File | null; const clientId = String(data.get('clientId') ?? '');
  let asset: { assetKey: string; assetUrl: string } | undefined;
  if (file && file.size) { const presign = await api<{ uploadUrl: string; assetKey: string; assetUrl: string }>('/api/uploads/presign', { method: 'POST', body: JSON.stringify({ clientId, filename: file.name, contentType: file.type, size: file.size }) }); const upload = await fetch(presign.uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file }); if (!upload.ok) throw new Error('O upload do arquivo falhou.'); asset = presign; }
  await api('/api/admin/contents', { method: 'POST', body: JSON.stringify({ clientId, title: data.get('title'), caption: data.get('caption'), publishDate: data.get('publishDate'), contentType: data.get('contentType'), assetKey: asset?.assetKey, assetUrl: asset?.assetUrl, status: 'Aguardando aprovação' }) }); state.modal = null; await loadAdmin();
}
async function submitChange(form: HTMLFormElement): Promise<void> { const contentId = state.modal?.split(':')[1]; await api(`/api/client/contents/${contentId}/changes`, { method: 'POST', body: JSON.stringify({ message: new FormData(form).get('message') }) }); state.modal = null; await loadClient(); }

root.addEventListener('click', async (event) => {
  const target = event.target as HTMLElement; const button = target.closest<HTMLElement>('button, a');
  try {
    if (button?.dataset.clientId) { state.filterClient = button.dataset.clientId; state.filterStatus = ''; state.adminClientTab = 'Conteúdos'; await loadAdmin(); if (button.dataset.modal) { state.modal = button.dataset.modal; adminView(); } return; }
    if (button?.dataset.clearClient !== undefined) { state.filterClient = ''; state.filterStatus = ''; state.adminClientTab = 'Conteúdos'; await loadAdmin(); return; }
    if (button?.dataset.adminTab) { state.adminClientTab = button.dataset.adminTab; adminView(); return; }
    if (button?.dataset.modal) { state.modal = button.dataset.modal; if (state.user?.role === 'admin') adminView(); return; }
    if (button?.dataset.closeModal) { state.modal = null; await refresh(); return; }
    if (button?.dataset.clientTab) { state.clientTab = button.dataset.clientTab; clientView(); return; }
    if (button?.dataset.approve) { await api(`/api/client/contents/${button.dataset.approve}/approve`, { method: 'POST' }); await loadClient(); return; }
    if (button?.dataset.change) { state.modal = `change:${button.dataset.change}`; clientView(); return; }
  } catch (error) { window.alert(error instanceof Error ? error.message : 'Não foi possível concluir a ação.'); }
});
root.addEventListener('change', async (event) => {
  const target = event.target as HTMLInputElement | HTMLSelectElement;
  try {
    if (target.dataset.filterStatus !== undefined) { state.filterStatus = target.value; await loadAdmin(); }
    if (target.dataset.filterClient !== undefined) { state.filterClient = target.value; await loadAdmin(); }
    if (target.dataset.statusId) { await api(`/api/admin/contents/${target.dataset.statusId}`, { method: 'PATCH', body: JSON.stringify({ status: target.value }) }); await loadAdmin(); }
    if (target.matches('input[type=file]') && 'files' in target) { const label = target.parentElement?.querySelector('[data-file-name]'); if (label) label.textContent = target.files?.[0]?.name || 'Escolher arquivo · até 50 MB'; }
  } catch (error) { window.alert(error instanceof Error ? error.message : 'Não foi possível atualizar.'); }
});
root.addEventListener('submit', async (event) => { event.preventDefault(); const form = event.target as HTMLFormElement; try { if (form.matches('[data-client-form]')) await submitClient(form); if (form.matches('[data-content-form]')) await submitContent(form); if (form.matches('[data-change-form]')) await submitChange(form); } catch (error) { window.alert(error instanceof Error ? error.message : 'Não foi possível salvar.'); } });

async function init(): Promise<void> {
  try { const result = await api<{ user: User | null }>('/api/auth/me'); state.user = result.user; if (!state.user) { loginView(new URLSearchParams(window.location.search).get('error') === 'not_registered' ? 'Seu e-mail ainda não está cadastrado pela TRAMA.' : ''); return; } await refresh(); }
  catch (error) { loginView(error instanceof Error ? error.message : 'Não foi possível carregar o portal.'); }
}
void init();
