import express from 'express';
import { listTuitions, createTuition, getTuition, updateTuition, deleteTuition, myTuitions, applicants, updateApplicationStatus } from '../controllers/tuition.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { requireTutor } from '../middleware/role.middleware.js';
import { validate, tuitionSchema } from '../utils/validation.js';

const r = express.Router();
// Public list and detail
r.get('/', listTuitions);
r.get('/:id', getTuition);

// Protected tutor routes
r.use(verifyToken);

r.get('/mine', requireTutor, myTuitions);
r.post('/', requireTutor, validate(tuitionSchema), createTuition);
r.put('/:id', requireTutor, validate(tuitionSchema), updateTuition);
r.delete('/:id', requireTutor, deleteTuition);

r.get('/:id/applicants', requireTutor, applicants);
r.patch('/applications/:appId', requireTutor, updateApplicationStatus);

export default r;
