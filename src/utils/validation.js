import { z } from 'zod';
export const registerSchema = z.object({ name:z.string().min(1), email:z.string().email(), password:z.string().min(6), role:z.enum(['student','tutor','admin']).optional() });
export const loginSchema = z.object({ email:z.string().email(), password:z.string().min(1) });
export const tuitionSchema = z.object({ subject:z.string(), location:z.string(), budget:z.number(), description:z.string().optional() });
export const applySchema = z.object({ tuitionId:z.string(), qualifications:z.string().optional(), experience:z.string().optional(), expectedSalary:z.number().optional() });
export const syncSchema = z.object({ name:z.string(), email:z.string().email(), role:z.enum(['student','tutor','admin']).optional() });
export function validate(schema){ return (req,res,next)=>{ const r=schema.safeParse(req.body); if(!r.success) return res.status(400).json({error:r.error.issues}); req.body=r.data; next(); }; }
