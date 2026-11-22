import Joi from 'joi';

// Schemas
export const registerSchema = Joi.object({
  name: Joi.string().min(1).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('student','tutor','admin').optional()
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(1).required()
});

export const tuitionSchema = Joi.object({
  subject: Joi.string().required(),
  location: Joi.string().required(),
  budget: Joi.number().required(),
  description: Joi.string().optional(),
  imageBase64: Joi.string().base64().optional()
});

export const applySchema = Joi.object({
  tuitionId: Joi.string().required(),
  qualifications: Joi.string().optional(),
  experience: Joi.string().optional(),
  expectedSalary: Joi.number().optional()
});

export const syncSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  role: Joi.string().valid('student','tutor','admin').optional()
});

// Validation middleware generator
export function validate(schema){
  return (req,res,next)=>{
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).json({ error: error.details.map(d=>d.message).join(', ') });
    req.body = value;
    next();
  };
}
