import mysql from 'mysql2/promise';

let pool: mysql.Pool | undefined;

function getPool(): mysql.Pool {
  if (!pool) {
    const url = process.env.DATABASE_URL ?? process.env.DRIZZLE_DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL is not configured');
    pool = mysql.createPool({
      uri: url,
      connectionLimit: 8,
      waitForConnections: true,
      queueLimit: 0,
      namedPlaceholders: false,
    });
  }
  return pool;
}

export async function query<T = any>(sql: string, params: unknown[] = []): Promise<T[]> {
  const [rows] = await getPool().query(sql, params);
  return rows as T[];
}

export async function execute(sql: string, params: unknown[] = []): Promise<mysql.ResultSetHeader> {
  const [result] = await getPool().execute(sql, params as any[]);
  return result as mysql.ResultSetHeader;
}

export async function ensureSchema(): Promise<void> {
  await execute(`CREATE TABLE IF NOT EXISTS portal_migrations (
    id VARCHAR(120) PRIMARY KEY,
    applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);

  const migrationId = '001_portal_core';
  const applied = await query<{ id: string }>('SELECT id FROM portal_migrations WHERE id = ?', [migrationId]);
  if (applied.length) return;

  const statements = [
    `CREATE TABLE IF NOT EXISTS portal_clients (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      company_name VARCHAR(180) NOT NULL,
      contact_name VARCHAR(180) NOT NULL,
      email VARCHAR(255) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uq_portal_client_email (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS portal_users (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      open_id VARCHAR(191) NOT NULL,
      email VARCHAR(255) NOT NULL,
      name VARCHAR(180) NOT NULL,
      role VARCHAR(20) NOT NULL,
      client_id BIGINT UNSIGNED NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uq_portal_user_open_id (open_id),
      KEY idx_portal_user_client (client_id),
      CONSTRAINT fk_portal_user_client FOREIGN KEY (client_id) REFERENCES portal_clients(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS portal_contents (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      client_id BIGINT UNSIGNED NOT NULL,
      title VARCHAR(220) NOT NULL,
      caption TEXT NOT NULL,
      publish_date DATE NULL,
      content_type VARCHAR(30) NOT NULL,
      asset_key VARCHAR(512) NULL,
      asset_url VARCHAR(768) NULL,
      status VARCHAR(40) NOT NULL DEFAULT 'Rascunho',
      alteration_count INT UNSIGNED NOT NULL DEFAULT 0,
      created_by BIGINT UNSIGNED NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      KEY idx_portal_content_client_status (client_id, status),
      CONSTRAINT fk_portal_content_client FOREIGN KEY (client_id) REFERENCES portal_clients(id) ON DELETE CASCADE,
      CONSTRAINT fk_portal_content_creator FOREIGN KEY (created_by) REFERENCES portal_users(id) ON DELETE RESTRICT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS portal_change_requests (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      content_id BIGINT UNSIGNED NOT NULL,
      user_id BIGINT UNSIGNED NOT NULL,
      request_number INT UNSIGNED NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      KEY idx_portal_change_content (content_id, request_number),
      CONSTRAINT fk_portal_change_content FOREIGN KEY (content_id) REFERENCES portal_contents(id) ON DELETE CASCADE,
      CONSTRAINT fk_portal_change_user FOREIGN KEY (user_id) REFERENCES portal_users(id) ON DELETE RESTRICT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS portal_sessions (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      token_hash CHAR(64) NOT NULL,
      open_id VARCHAR(191) NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uq_portal_session_token (token_hash),
      KEY idx_portal_session_expiry (expires_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  ];

  for (const statement of statements) await execute(statement);
  await execute('INSERT INTO portal_migrations (id) VALUES (?)', [migrationId]);
}

export async function closeDb(): Promise<void> {
  if (pool) await pool.end();
  pool = undefined;
}
