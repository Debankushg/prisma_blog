import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type Express } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { env } from './configs/env';
import { openApiDocument } from './configs/swagger';
import { errorHandler, notFoundHandler } from './middleware/error';
import routes from './routes';

export const createApp = (): Express => {
  const app = express();

  app.disable('x-powered-by');
  // Swagger UI relies on inline scripts, so mount it before helmet's CSP applies.
  app.get('/api-docs.json', (_req, res) => res.json(openApiDocument));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument, { customSiteTitle: 'Blogging API Docs' }));

  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(','), credentials: true }));
  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());
  if (env.NODE_ENV !== 'test') app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

  app.use('/api/v1/auth/forgot-password', rateLimit({ windowMs: 15 * 60 * 1000, limit: 5, standardHeaders: true, legacyHeaders: false }));
  app.use('/api/v1/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 100, standardHeaders: true, legacyHeaders: false }));
  app.use('/api/v1/public', rateLimit({ windowMs: 60 * 1000, limit: 120, standardHeaders: true, legacyHeaders: false }));
  app.use('/api/v1', routes);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
};
