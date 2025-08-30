#!/usr/bin/env node

/**
 * Neon Database Setup Script
 * Configures your local and production environment for Neon
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function main() {
  console.log('🚀 Neon Database Setup\n');
  console.log('=' .repeat(50));
  
  // Get the Neon connection string
  console.log('\n📋 Step 1: Enter your Neon pooled connection string');
  console.log('(It should contain "-pooler" in the hostname)\n');
  
  const connectionString = await question('Neon pooled connection string: ');
  
  if (!connectionString.includes('-pooler')) {
    console.log('\n⚠️  WARNING: Your connection string doesn\'t contain "-pooler"');
    console.log('Make sure you\'re using the POOLED connection, not the direct one!\n');
    const proceed = await question('Continue anyway? (y/n): ');
    if (proceed.toLowerCase() !== 'y') {
      console.log('Setup cancelled.');
      process.exit(0);
    }
  }
  
  // Add pooling parameters
  let finalUrl = connectionString;
  if (!finalUrl.includes('pgbouncer=true')) {
    const separator = finalUrl.includes('?') ? '&' : '?';
    finalUrl += `${separator}pgbouncer=true&connect_timeout=15&pool_timeout=0`;
  }
  
  // Create .env.local file
  const envLocal = `# Neon Database Connection (Pooled)
DATABASE_URL="${finalUrl}"

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
AUTH_SECRET=dev-secret-at-least-32-characters-long-replace-in-prod
AUTH_GOOGLE_ID=***REMOVED***
AUTH_GOOGLE_SECRET=your-google-client-secret-here

# Email Configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
EMAIL_FROM=noreply@dbt-diarycard.vercel.app
`;

  const envPath = path.join(__dirname, '..', '.env.local');
  fs.writeFileSync(envPath, envLocal);
  console.log('\n✅ Created .env.local file');
  
  // Create .env.production for Vercel
  const envProduction = `# Neon Database Connection (Pooled)
DATABASE_URL="${finalUrl}"

# NextAuth Configuration - UPDATE THESE!
NEXTAUTH_URL=https://dbt-diarycard.vercel.app
AUTH_SECRET=generate-with-openssl-rand-base64-32
AUTH_GOOGLE_ID=***REMOVED***
AUTH_GOOGLE_SECRET=your-google-client-secret-here

# Node Environment
NODE_ENV=production
`;

  const envProdPath = path.join(__dirname, '..', '.env.production');
  fs.writeFileSync(envProdPath, envProduction);
  console.log('✅ Created .env.production file');
  
  console.log('\n' + '=' .repeat(50));
  console.log('\n📋 Next Steps:\n');
  console.log('1. Push schema to Neon:');
  console.log('   npx prisma db push\n');
  
  console.log('2. Seed the database (if needed):');
  console.log('   npx prisma db seed\n');
  
  console.log('3. Test locally:');
  console.log('   npm run dev\n');
  
  console.log('4. Update Vercel environment:');
  console.log('   vercel env add DATABASE_URL production');
  console.log('   (paste the connection string when prompted)\n');
  
  console.log('5. Deploy to Vercel:');
  console.log('   vercel --prod\n');
  
  console.log('=' .repeat(50));
  console.log('\n🎯 Your Neon connection string has been configured!');
  console.log('DATABASE_URL has been added to .env.local and .env.production\n');
  
  rl.close();
}

main().catch(console.error);
