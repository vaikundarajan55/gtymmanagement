// Applies one or more .sql files to the configured database.
// Usage: npm run sql -- sql/004_banners.sql
import 'dotenv/config';
import { readFile } from 'fs/promises';
import mysql from 'mysql2/promise';

const files = process.argv.slice(2);
if (!files.length) {
  console.error('Usage: npm run sql -- <file.sql> [more.sql]');
  process.exit(1);
}

const conn = await mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'admin_gym_management',
  multipleStatements: true,
  charset: 'utf8mb4',
});

try {
  for (const file of files) {
    await conn.query(await readFile(file, 'utf8'));
    console.log(`Applied ${file}`);
  }
} catch (err) {
  console.error(`Failed: ${err.message}`);
  process.exitCode = 1;
} finally {
  await conn.end();
}
