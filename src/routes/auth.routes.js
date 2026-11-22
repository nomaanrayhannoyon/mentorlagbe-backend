import express from 'express';
import { register, login, me } from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
const r = express.Router();
r.post('/register', register);
r.post('/login', login);
r.get('/me', verifyToken, me);
export default r;
