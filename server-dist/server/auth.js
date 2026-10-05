import crypto from 'node:crypto';
import { jwtVerify } from 'jose';
import { execute, query } from './db.js';
export const SESSION_COOKIE = 'webdev_app_session';
const STATE_COOKIE = 'trama_oauth_state';
const SESSION_DAYS = 30;
function secureCookie() {
    return process.env.NODE_ENV === 'production' || process.env.MANUS_ADDON_PREVIEW_PUBLIC_ORIGIN?.startsWith('https://') === true;
}
function cookieSameSite() {
    return secureCookie() ? 'None' : 'Lax';
}
function cookieHeader(name, value, maxAge, httpOnly = true) {
    const parts = [`${name}=${encodeURIComponent(value)}`, 'Path=/', `Max-Age=${maxAge}`, `SameSite=${cookieSameSite()}`];
    if (httpOnly)
        parts.push('HttpOnly');
    if (secureCookie())
        parts.push('Secure');
    return parts.join('; ');
}
function deleteCookie(name) {
    return cookieHeader(name, '', 0);
}
function parseCookies(header) {
    return Object.fromEntries((header ?? '').split(';').map((part) => {
        const index = part.indexOf('=');
        if (index < 0)
            return ['', ''];
        return [part.slice(0, index).trim(), decodeURIComponent(part.slice(index + 1).trim())];
    }).filter(([key]) => key));
}
function tokenHash(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}
function publicUser(row) {
    return { id: Number(row.id), openId: row.open_id, email: row.email, name: row.name, role: row.role, clientId: row.client_id ? Number(row.client_id) : null };
}
async function userFromIdentity(identity) {
    const existing = await query('SELECT id, open_id, email, name, role, client_id FROM portal_users WHERE open_id = ? LIMIT 1', [identity.openId]);
    if (existing[0]) {
        await execute('UPDATE portal_users SET email = ?, name = ? WHERE id = ?', [identity.email, identity.name || identity.email, existing[0].id]);
        return publicUser({ ...existing[0], email: identity.email, name: identity.name || identity.email });
    }
    const matchingClient = identity.email
        ? await query('SELECT id FROM portal_clients WHERE LOWER(email) = LOWER(?) LIMIT 1', [identity.email])
        : [];
    const users = await query('SELECT COUNT(*) AS count FROM portal_users');
    if (!matchingClient[0] && Number(users[0]?.count ?? 0) > 0)
        throw new Error('NOT_REGISTERED');
    const role = matchingClient[0] ? 'client' : 'admin';
    const result = await execute('INSERT INTO portal_users (open_id, email, name, role, client_id) VALUES (?, ?, ?, ?, ?)', [identity.openId, identity.email || 'sem-email', identity.name || identity.email || 'Usuário TRAMA', role, matchingClient[0]?.id ?? null]);
    return { id: Number(result.insertId), openId: identity.openId, email: identity.email, name: identity.name || identity.email, role, clientId: matchingClient[0]?.id ? Number(matchingClient[0].id) : null };
}
async function identityFromApi(token) {
    const base = process.env.MANUS_OAUTH_API_URL;
    if (!base)
        return null;
    const response = await fetch(`${base}/webdev.v1.WebDevAuthPublicService/GetUserInfo`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: token }),
    });
    if (!response.ok)
        return null;
    const body = await response.json();
    if (!body.openId)
        return null;
    return { openId: body.openId, name: body.name ?? '', email: body.email ?? '' };
}
async function identityFromJwt(token) {
    const secret = process.env.MANUS_JWT_SECRET;
    if (!secret)
        return null;
    try {
        const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), { algorithms: ['HS256'] });
        if (payload.appId && process.env.MANUS_PROJECT_ID && payload.appId !== process.env.MANUS_PROJECT_ID)
            return null;
        const openId = String(payload.openId ?? payload.open_id ?? payload.sub ?? '');
        if (!openId)
            return null;
        return { openId, email: String(payload.email ?? ''), name: String(payload.name ?? '') };
    }
    catch {
        return null;
    }
}
export async function userFromRequest(request) {
    const cookies = parseCookies(request.headers.cookie);
    const token = cookies[SESSION_COOKIE] || request.headers.authorization?.replace(/^Bearer\s+/i, '');
    if (!token)
        return null;
    const jwtIdentity = await identityFromJwt(token);
    if (jwtIdentity)
        return userFromIdentity(jwtIdentity);
    const sessions = await query(`SELECT u.id, u.open_id, u.email, u.name, u.role, u.client_id
       FROM portal_sessions s JOIN portal_users u ON u.open_id = s.open_id
      WHERE s.token_hash = ? AND s.expires_at > NOW() LIMIT 1`, [tokenHash(token)]);
    return sessions[0] ? publicUser(sessions[0]) : null;
}
export async function requireUser(request) {
    const user = await userFromRequest(request);
    if (!user)
        throw Object.assign(new Error('AUTH_REQUIRED'), { status: 401 });
    return user;
}
export async function requireAdmin(request) {
    const user = await requireUser(request);
    if (user.role !== 'admin')
        throw Object.assign(new Error('ADMIN_REQUIRED'), { status: 403 });
    return user;
}
function safeOrigin(value) {
    if (typeof value !== 'string')
        throw Object.assign(new Error('INVALID_ORIGIN'), { status: 400 });
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.pathname !== '/' || url.search || url.hash)
        throw Object.assign(new Error('INVALID_ORIGIN'), { status: 400 });
    return url.origin;
}
export function startLogin(request, response) {
    const origin = safeOrigin(request.query.origin);
    const redirectUri = `${origin}/api/auth/callback`;
    const nonce = crypto.randomBytes(24).toString('hex');
    const state = Buffer.from(JSON.stringify({ nonce, redirectUri }), 'utf8').toString('base64url');
    const portal = process.env.MANUS_OAUTH_PORTAL_URL;
    const appId = process.env.MANUS_PROJECT_ID;
    if (!portal || !appId)
        throw new Error('OAUTH_NOT_CONFIGURED');
    response.setHeader('Set-Cookie', cookieHeader(STATE_COOKIE, nonce, 600));
    const url = new URL(`${portal.replace(/\/$/, '')}/app-auth`);
    url.searchParams.set('appId', appId);
    url.searchParams.set('redirectUri', redirectUri);
    url.searchParams.set('state', state);
    url.searchParams.set('responseType', 'code');
    response.redirect(url.toString());
}
export async function completeLogin(request, response) {
    const rawState = String(request.query.state ?? '');
    const code = String(request.query.code ?? '');
    if (!rawState || !code)
        throw new Error('OAUTH_CALLBACK_INVALID');
    const parsed = JSON.parse(Buffer.from(rawState, 'base64url').toString('utf8'));
    const cookies = parseCookies(request.headers.cookie);
    if (!parsed.nonce || cookies[STATE_COOKIE] !== parsed.nonce)
        throw new Error('OAUTH_STATE_INVALID');
    const base = process.env.MANUS_OAUTH_API_URL;
    const clientId = process.env.MANUS_PROJECT_ID;
    if (!base || !clientId)
        throw new Error('OAUTH_NOT_CONFIGURED');
    const exchange = await fetch(`${base}/webdev.v1.WebDevAuthPublicService/ExchangeToken`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, grantType: 'authorization_code', code, redirectUri: parsed.redirectUri }),
    });
    if (!exchange.ok)
        throw new Error('OAUTH_EXCHANGE_FAILED');
    const body = await exchange.json();
    if (!body.accessToken)
        throw new Error('OAUTH_TOKEN_MISSING');
    const identity = await identityFromApi(body.accessToken);
    if (!identity)
        throw new Error('OAUTH_IDENTITY_FAILED');
    const user = await userFromIdentity(identity);
    await execute('INSERT INTO portal_sessions (token_hash, open_id, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? DAY)) ON DUPLICATE KEY UPDATE open_id = VALUES(open_id), expires_at = VALUES(expires_at)', [tokenHash(body.accessToken), user.openId, SESSION_DAYS]);
    response.setHeader('Set-Cookie', [cookieHeader(SESSION_COOKIE, body.accessToken, SESSION_DAYS * 86400), deleteCookie(STATE_COOKIE)]);
    response.redirect(`${parsed.redirectUri.replace(/\/api\/auth\/callback$/, '')}/portal?login=success`);
}
export async function logout(request, response) {
    const cookies = parseCookies(request.headers.cookie);
    const token = cookies[SESSION_COOKIE];
    if (token)
        await execute('DELETE FROM portal_sessions WHERE token_hash = ?', [tokenHash(token)]);
    response.setHeader('Set-Cookie', deleteCookie(SESSION_COOKIE));
    response.redirect('/portal?logout=success');
}
//# sourceMappingURL=auth.js.map