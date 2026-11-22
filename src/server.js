import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import tuitionRoutes from './routes/tuition.routes.js';
import applicationRoutes from './routes/application.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import userRoutes from './routes/user.routes.js';
import adminRoutes from './routes/admin.routes.js';

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CORS_ALLOWED_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));

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
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

await connectDB();
app.listen(port, () => console.log(`Server listening on ${port}`));
