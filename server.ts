import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { apiRouter } from './src/server/routes/api.js';
import { authMiddleware, csrfProtection } from './src/server/middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);
  const isProduction = process.env.NODE_ENV === 'production';

  // Request ID middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    req.headers['x-request-id'] = req.headers['x-request-id'] || `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    next();
  });

  // Body parser with raw body capture for webhook signature verification (NFR-01, FR-10)
  app.use(
    express.json({
      verify: (req: Request, res: Response, buf: Buffer) => {
        req.rawBody = buf.toString('utf8');
      },
      limit: '2mb',
    })
  );
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Security headers
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  // Session & Authentication middleware
  app.use(authMiddleware);

  // CSRF validation middleware
  app.use(csrfProtection);

  // Mount API Router under /api
  app.use('/api', apiRouter);

  // API 404 handler
  app.use('/api/*', (req: Request, res: Response) => {
    res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: `Endpoint ${req.method} ${req.originalUrl} does not exist.`,
        requestId: req.headers['x-request-id'],
      },
    });
  });

  // Global Error Handler (Section 11.1 Standard Error Contract: no stack traces or DB internals)
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(`[API Error] [${req.headers['x-request-id']}]:`, err.message || err);
    const statusCode = err.status || err.statusCode || 500;
    res.status(statusCode).json({
      error: {
        code: err.code || 'INTERNAL_SERVER_ERROR',
        message: err.userMessage || err.message || 'An unexpected error occurred. Please try again.',
        requestId: req.headers['x-request-id'],
      },
    });
  });

  // Mount Vite or static build
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ShopEase Server] Listening on http://0.0.0.0:${PORT} in ${isProduction ? 'production' : 'development'} mode.`);
  });
}

startServer().catch((err) => {
  console.error('[ShopEase Server] Failed to start:', err);
  process.exit(1);
});
