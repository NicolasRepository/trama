import { closeDb, ensureSchema } from './db.js';

try {
  await ensureSchema();
  console.log('Portal TRAMA database schema is ready.');
} finally {
  await closeDb();
}
