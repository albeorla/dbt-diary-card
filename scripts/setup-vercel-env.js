#!/usr/bin/env node

/**
 * Vercel Environment Setup Script
 * Generates production-ready environment variables for Vercel deployment
 * Usage: node scripts/setup-vercel-env.js
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 DBT Diary Card - Vercel Environment Setup\n');
console.log('=' .repeat(50));

// Generate secure AUTH_SECRET
const authSecret = crypto.randomBytes(32).toString('base64');

// Configuration template
const envConfig = {
  // Critical Authentication Variables
  NEXTAUTH_URL: 'https://dbt-diarycard.vercel.app',
  AUTH_SECRET: authSecret,
  
  // Google OAuth (user needs to provide these)
  AUTH_GOOGLE_ID: '***REMOVED***',
  AUTH_GOOGLE_SECRET: '<YOUR_GOOGLE_CLIENT_SECRET>',
  
  // Database with proper pooling for Vercel
  DATABASE_URL: 'postgresql://<user>:<password>@<host>:5432/<database>?pgbouncer=true&connect_timeout=15&pool_timeout=0',
  
  // Email configuration (optional)
  SMTP_HOST: 'smtp.gmail.com',
  SMTP_PORT: '465',
  SMTP_USER: '<your-email@gmail.com>',
  SMTP_PASS: '<your-app-specific-password>',
  EMAIL_FROM: 'noreply@dbt-diarycard.vercel.app',
  
  // Stripe (optional)
  STRIPE_SECRET_KEY: '***REMOVED***',
  STRIPE_WEBHOOK_SECRET: 'whsec_placeholder',
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test_placeholder',
  
  // Node environment
  NODE_ENV: 'production'
};

// Generate .env.production file
const envContent = Object.entries(envConfig)
  .map(([key, value]) => `${key}=${value}`)
  .join('\n');

const envPath = path.join(__dirname, '..', '.env.production');

console.log('\n📝 Generated Environment Configuration:\n');
console.log('-'.repeat(50));

// Display configuration (hiding sensitive parts)
Object.entries(envConfig).forEach(([key, value]) => {
  if (key === 'AUTH_SECRET') {
    console.log(`${key}=${value.substring(0, 10)}... (${value.length} chars)`);
  } else if (key.includes('SECRET') || key.includes('PASS')) {
    console.log(`${key}=<NEEDS_YOUR_VALUE>`);
  } else {
    console.log(`${key}=${value}`);
  }
});

console.log('\n' + '=' .repeat(50));
console.log('\n📋 Next Steps:\n');

console.log('1. Update these values in the generated .env.production file:');
console.log('   - AUTH_GOOGLE_SECRET: Get from Google Cloud Console');
console.log('   - DATABASE_URL: Use your cloud PostgreSQL URL');
console.log('   - SMTP credentials (if using email features)\n');

console.log('2. Recommended Database Providers for Vercel:');
console.log('   - Neon (https://neon.tech) - Works great with Vercel');
console.log('   - Supabase (https://supabase.com)');
console.log('   - Vercel Postgres (https://vercel.com/storage/postgres)');
console.log('   - Railway (https://railway.app)\n');

console.log('3. Configure Google OAuth:');
console.log('   a. Go to https://console.cloud.google.com/apis/credentials');
console.log('   b. Select your OAuth 2.0 Client ID');
console.log('   c. Add this EXACT redirect URI:');
console.log('      https://dbt-diarycard.vercel.app/api/auth/callback/google\n');

console.log('4. Deploy to Vercel:');
console.log('   a. Install Vercel CLI: npm i -g vercel');
console.log('   b. Run: vercel --prod');
console.log('   c. When prompted, set environment variables from .env.production\n');

console.log('5. Alternative: Set via Vercel Dashboard:');
console.log('   a. Go to https://vercel.com/dashboard');
console.log('   b. Select your project → Settings → Environment Variables');
console.log('   c. Add each variable from .env.production\n');

// Write the file
try {
  fs.writeFileSync(envPath, envContent);
  console.log(`✅ Environment file created: ${envPath}\n`);
  console.log('⚠️  IMPORTANT: Do NOT commit .env.production to Git!\n');
} catch (error) {
  console.error('❌ Error writing environment file:', error.message);
}

// Generate Vercel CLI command
console.log('=' .repeat(50));
console.log('\n🎯 Quick Vercel CLI Setup Commands:\n');
console.log('# Set all environment variables at once:');

const vercelCommands = Object.entries(envConfig)
  .filter(([key]) => !key.includes('<'))
  .map(([key, value]) => {
    const displayValue = key === 'AUTH_SECRET' ? value : 
                        key.includes('SECRET') ? '<YOUR_VALUE>' : value;
    return `vercel env add ${key} production`;
  });

console.log(vercelCommands.join('\n'));

console.log('\n# Then deploy:');
console.log('vercel --prod\n');

console.log('=' .repeat(50));
console.log('\n📚 Documentation:');
console.log('   - NextAuth.js: https://next-auth.js.org/');
console.log('   - Vercel Env: https://vercel.com/docs/environment-variables');
console.log('   - Prisma + Vercel: https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel\n');
