import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// existing imports
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { connectDB } from './src/config/db.js';
import logger from './src/utils/logger.js';
import './src/config/env.js';
import authRoutes from './src/routes/auth.routes.js';
import tuitionRoutes from './src/routes/tuition.routes.js';
import applicationRoutes from './src/routes/application.routes.js';
import paymentRoutes from './src/routes/payment.routes.js';
import userRoutes from './src/routes/user.routes.js';
import adminRoutes from './src/routes/admin.routes.js';
import healthRoutes from './src/routes/health.routes.js';



const app = express();
const port = process.env.PORT || 5000;

app.use(helmet());
app.use(rateLimit({ windowMs: 15*60*1000, max: 100 }));


// stripe webhook needs raw body
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

app.get('/', (req, res) => res.send('MentorLagbe API running'));


app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tuitions', tuitionRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);


app.use((err, req, res, next) => {
  logger.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

await connectDB();
app.listen(port, () => console.log(`Server listening on ${port}`));
 export default app;