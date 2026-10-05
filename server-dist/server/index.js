import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { ensureSchema } from './db.js';
import { router } from './routes.js';
const isProduction = process.env.NODE_ENV === 'production';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), isProduction ? '../..' : '..');
const port = Number(process.env.PORT ?? 3000);
async function main() {
    await ensureSchema();
    const app = express();
    app.disable('x-powered-by');
    app.use(express.json({ limit: '2mb' }));
    app.use('/api', router);
    app.get('/_app/health', (_request, response) => response.status(200).json({ ok: true, service: 'trama' }));
    if (isProduction) {
        const dist = path.join(root, 'dist');
        app.use(express.static(dist, { index: false }));
        app.get('/portal', (_request, response) => response.sendFile(path.join(dist, 'portal.html')));
        app.get('/portal/', (_request, response) => response.sendFile(path.join(dist, 'portal.html')));
        app.use((request, response, next) => {
            if (request.path.startsWith('/api/') || request.path === '/_app/health')
                return next();
            return response.sendFile(path.join(dist, 'index.html'));
        });
    }
    else {
        app.get('/portal', (_request, response) => response.sendFile(path.join(root, 'portal.html')));
        app.get('/portal/', (_request, response) => response.sendFile(path.join(root, 'portal.html')));
        const vite = await createViteServer({ root, server: { middlewareMode: true }, appType: 'spa' });
        app.use(vite.middlewares);
    }
    app.use((error, _request, response, _next) => {
        const status = Number(error?.status) || 500;
        if (status >= 500)
            console.error(error);
        response.status(status).json({ error: error?.message || 'Erro interno.' });
    });
    app.listen(port, '0.0.0.0', () => console.log(`TRAMA server listening on 0.0.0.0:${port}`));
}
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
//# sourceMappingURL=index.js.map