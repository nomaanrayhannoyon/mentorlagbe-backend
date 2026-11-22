// Environment variable validation for MentorLagbe server
// This module runs at import time and aborts the process if any required variable is missing.

const required = [
  'MONGODB_URI',
  'MONGODB_DB',
  'JWT_SECRET',

  'STRIPE_SECRET_KEY',

  'IMGBB_API_KEY',
  'CORS_ALLOWED_ORIGIN',
  'CLIENT_URL',
];

const missing = required.filter((key) => !(process.env[key] && process.env[key].trim()));

if (missing.length > 0) {
  console.error('❌ Missing required environment variables:', missing.join(', '));
  process.exit(1);
}

// Export nothing; simply ensure validation runs on import.
export {};
