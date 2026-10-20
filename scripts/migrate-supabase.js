import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  const connectionString = process.env.DATABASE_URL || process.argv[2];

  if (!connectionString) {
    console.error('❌ Harap berikan database connection string atau password.');
    console.log('Penggunaan: node scripts/migrate-supabase.js "postgresql://postgres:[PASSWORD]@db.<PROJECT-REF>.supabase.co:5432/postgres"');
    process.exit(1);
  }

  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔌 Menghubungkan ke database Supabase...');
    await client.connect();
    console.log('✅ Berhasil terhubung!');

    const schemaPath = path.join(__dirname, '../supabase/schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log('⚡ Menjalankan skema tabel dan seed data...');
    await client.query(sql);

    console.log('🎉 SELAMAT! Semua tabel, policy RLS, bucket storage, dan initial seed data berhasil dibuat di Supabase!');
  } catch (err) {
    console.error('❌ Gagal menjalankan migrasi:', err.message);
  } finally {
    await client.end();
  }
}

runMigration();
