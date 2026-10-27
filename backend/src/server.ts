import { createApp } from './app';
import { connectDatabase, disconnectDatabase } from './configs/database';
import { env } from './configs/env';

const SHUTDOWN_TIMEOUT_MS = 10_000;

const main = async (): Promise<void> => {
  try {
    await connectDatabase();
  } catch (error) {
    console.error('Could not connect to the database. Check DATABASE_URL and that PostgreSQL is running.', error);
    process.exit(1);
  }

  const server = createApp().listen(env.PORT, () => console.log(`Server listening on :${env.PORT} (${env.NODE_ENV})`));

  // Listen errors (e.g. port already in use) are emitted, not thrown.
  server.on('error', (error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE') console.error(`Port ${env.PORT} is already in use`);
    else console.error('Server error', error);
    process.exit(1);
  });

  let shuttingDown = false;
  const shutdown = (signal: string): void => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`${signal} received, shutting down`);

    // Don't hang forever on stuck connections.
    setTimeout(() => {
      console.error('Shutdown timed out, forcing exit');
      process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS).unref();

    server.close(async () => {
      try {
        await disconnectDatabase();
        process.exit(0);
      } catch (error) {
        console.error('Error while shutting down', error);
        process.exit(1);
      }
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
};

// State is unknown after these, so log and exit; a process manager (pm2, Docker, systemd) restarts us.
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection', reason);
  process.exit(1);
});
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception', error);
  process.exit(1);
});

main().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
