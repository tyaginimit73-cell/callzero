import http from 'http';
import app from './app.js';
import env from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import { initSocket } from './sockets/index.js';
import { ensureDemoData } from './services/seedService.js';

async function start() {
  await connectDB();
  await ensureDemoData();

  const server = http.createServer(app);
  const io = initSocket(server);

  server.listen(env.PORT, () => {
    console.log(`[server] CallZero API listening on port ${env.PORT} (${env.NODE_ENV})`);
    console.log(`[server] CORS origin: ${env.CLIENT_URL}`);
  });

  const shutdown = async (signal) => {
    console.log(`\n[server] ${signal} received, shutting down...`);
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 5000).unref();
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  return { server, io };
}

// When run as a module directly (tests import app separately), start.
if (process.argv[1] && process.argv[1].endsWith('server.js')) {
  start().catch((err) => {
    console.error('[server] failed to start', err);
    process.exit(1);
  });
}

export { start };
