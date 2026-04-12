import logger from '#config/logger.js';
import { cookies } from '#utils/cookies.js';
import { jwttoken } from '#utils/jwt.js';

const getToken = req => {
  const authHeader = req.get('Authorization') || '';
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  return cookies.get(req, 'token');
};

export const authMiddleware = (req, res, next) => {
  const token = getToken(req);
  if (!token) {
    req.user = undefined;
    return next();
  }

  try {
    req.user = jwttoken.verify(token);
  } catch (error) {
    logger.warn('Invalid auth token', {
      message: error.message,
      path: req.path,
      method: req.method,
    });
    req.user = undefined;
  }

  return next();
};

export const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
};
