import { Request, Response, NextFunction } from 'express';
import { store } from '../db/store.js';
import { User } from '../../shared/types.js';

declare global {
  namespace Express {
    interface Request {
      user?: User;
      sessionToken?: string;
      csrfToken?: string;
      rawBody?: string;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const sessionToken = req.cookies?.shopease_session || req.headers['x-session-token'];

  if (sessionToken && typeof sessionToken === 'string') {
    const session = store.sessions.get(sessionToken);
    if (session) {
      if (Date.now() > session.expiresAt) {
        store.sessions.delete(sessionToken);
      } else {
        const user = store.users.get(session.userId);
        if (user) {
          req.user = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
          };
          req.sessionToken = sessionToken;
          req.csrfToken = session.csrfToken;
        }
      }
    }
  }
  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication is required to access this resource.',
        requestId: req.headers['x-request-id'] || 'req_' + Date.now(),
      },
    });
  }
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication is required.',
        requestId: req.headers['x-request-id'] || 'req_' + Date.now(),
      },
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      error: {
        code: 'FORBIDDEN',
        message: 'Administrative privileges are required for this action.',
        requestId: req.headers['x-request-id'] || 'req_' + Date.now(),
      },
    });
  }

  next();
}

export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  // Webhooks use cryptographic HMAC signature validation, not CSRF tokens
  if (req.path.startsWith('/api/payments/webhook')) {
    return next();
  }

  // Safe read-only HTTP methods do not require CSRF token
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  // For unauthenticated endpoints (like login/register before session exists)
  if (!req.user || !req.sessionToken) {
    return next();
  }

  const clientToken = req.headers['x-csrf-token'];
  if (!clientToken || clientToken !== req.csrfToken) {
    return res.status(403).json({
      error: {
        code: 'CSRF_VALIDATION_FAILED',
        message: 'Invalid or missing CSRF token. Please refresh your session.',
        requestId: req.headers['x-request-id'] || 'req_' + Date.now(),
      },
    });
  }

  next();
}
