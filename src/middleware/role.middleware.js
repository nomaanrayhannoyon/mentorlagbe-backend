// Role‑based access middleware
// Usage: import { requireAdmin, requireTutor, requireStudent } from '../middleware/role.middleware.js';

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
};

export const requireAdmin = requireRole('admin');
export const requireTutor = requireRole('tutor');
export const requireStudent = requireRole('student');
