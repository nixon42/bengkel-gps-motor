import 'dotenv/config';
import { initDatabase } from './db/index.js';
import { createApp } from './app.js';

const PORT = process.env.PORT || 3000;

try {
  console.log('Initializing Bengkel Mobil GPS Motor Kediri database...');
  const db = initDatabase();
  console.log('SQLite database initialized with WAL mode and foreign keys enabled.');

  const app = createApp(db);

  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`  BENGKEL MOBIL GPS MOTOR KEDIRI - SERVER RUNNING`);
    console.log(`  Port: http://localhost:${PORT}`);
    console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`  Healthcheck: http://localhost:${PORT}/api/health`);
    console.log(`=======================================================`);
  });
} catch (err) {
  console.error('Fatal Server Boot Error:', err);
  process.exit(1);
}
