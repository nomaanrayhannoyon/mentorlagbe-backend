import express from 'express';
import { profile, updateProfile } from '../controllers/user.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
const r = express.Router();
r.get('/profile', verifyToken, profile);
r.put('/profile', verifyToken, updateProfile);
export default r;
