#!/usr/bin/env node

/**
 * Environment Verification Script
 * Run this to check if your environment variables are properly configured
 * Usage: node scripts/verify-env.js
 */

import crypto from 'crypto';

console.log('🔍 DBT Diary Card - Environment Configuration Check\n');
console.log('=' .repeat(50));

// Check required environment variables
const requiredVars = {
  NEXTAUTH_URL: {
    check: (val) => val && val.startsWith('http'),
    error: 'Must be a valid URL starting with http:// or https://',
    example: 'https://dbt-diarycard.vercel.app or http://localhost:3000'
  },
  AUTH_SECRET: {
    check: (val) => val && val.length >= 32,
    error: 'Must be at least 32 characters long',
    example: 'Generate with: openssl rand -base64 32'
  },
  AUTH_GOOGLE_ID: {
    check: (val) => val && val.includes('.apps.googleusercontent.com'),
    error: 'Must be a valid Google OAuth Client ID',
    example: '123456789-abcdef.apps.googleusercontent.com'
  },
  AUTH_GOOGLE_SECRET: {
    check: (val) => val && val.length > 0,
    error: 'Must not be empty',
    example: 'Get from Google Cloud Console'
  },
  DATABASE_URL: {
    check: (val) => val && val.startsWith('postgresql://'),
    error: 'Must be a valid PostgreSQL connection string',
    example: 'postgresql://user:pass@host:5432/database'
  }
};

let hasErrors = false;
const results = {};

// Check each required variable
for (const [varName, config] of Object.entries(requiredVars)) {
  const value = process.env[varName];
  const isSet = !!value;
  const isValid = isSet && config.check(value);
  
  results[varName] = {
    isSet,
    isValid,
    error: !isValid ? config.error : null,
    example: config.example
  };
  
  if (!isValid) hasErrors = true;
}

// Display results
console.log('\n📋 Required Environment Variables:\n');

for (const [varName, result] of Object.entries(results)) {
  const status = result.isValid ? '✅' : result.isSet ? '⚠️ ' : '❌';
  const value = process.env[varName];
  
  console.log(`${status} ${varName}`);
  
  if (result.isValid) {
    if (varName === 'AUTH_SECRET') {
      console.log(`   Value: [HIDDEN - ${value.length} chars]`);
    } else if (varName === 'DATABASE_URL') {
      // Hide password in DATABASE_URL
      const masked = value.replace(/:([^@]+)@/, ':****@');
      console.log(`   Value: ${masked}`);
    } else if (varName === 'AUTH_GOOGLE_SECRET') {
      console.log(`   Value: ${value.substring(0, 4)}****`);
    } else {
      console.log(`   Value: ${value}`);
    }
  } else {
    console.log(`   Status: ${result.isSet ? 'Invalid' : 'Not set'}`);
    console.log(`   Error: ${result.error}`);
    console.log(`   Example: ${result.example}`);
  }
  console.log();
}

// Additional checks
console.log('=' .repeat(50));
console.log('\n🔧 Additional Checks:\n');

// Check if running in production
const isProduction = process.env.NODE_ENV === 'production';
console.log(`${isProduction ? '⚠️ ' : '✅'} NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
if (isProduction) {
  console.log('   Warning: Running in production mode');
}

// Check NEXTAUTH_URL protocol
if (process.env.NEXTAUTH_URL) {
  const isHttps = process.env.NEXTAUTH_URL.startsWith('https://');
  const isLocalhost = process.env.NEXTAUTH_URL.includes('localhost');
  
  if (!isHttps && !isLocalhost) {
    console.log('\n⚠️  NEXTAUTH_URL uses HTTP but is not localhost');
    console.log('   This will cause issues with secure cookies in production');
  }
}

// Check DATABASE_URL for pooling parameters
if (process.env.DATABASE_URL) {
  const hasPooling = process.env.DATABASE_URL.includes('pgbouncer=true') || 
                     process.env.DATABASE_URL.includes('pool.');
  
  if (!hasPooling && isProduction) {
    console.log('\n💡 Tip: Consider adding connection pooling to DATABASE_URL');
    console.log('   Add: ?pgbouncer=true&connect_timeout=15');
  }
}

// Generate AUTH_SECRET if needed
if (!process.env.AUTH_SECRET) {
  console.log('\n💡 Generate AUTH_SECRET with:');
  console.log('   openssl rand -base64 32');
  console.log('\n   Or use this generated one:');
  console.log(`   ${crypto.randomBytes(32).toString('base64')}`);
}

// Summary
console.log('\n' + '=' .repeat(50));
if (hasErrors) {
  console.log('\n❌ Environment configuration has errors!');
  console.log('   Please fix the issues above before deploying.\n');
  process.exit(1);
} else {
  console.log('\n✅ Environment configuration looks good!');
  console.log('   Ready for deployment.\n');
  
  // Deployment checklist
  console.log('📝 Deployment Checklist:');
  console.log('   1. Set all environment variables in Vercel Dashboard');
  console.log('   2. Verify Google OAuth redirect URI matches NEXTAUTH_URL');
  console.log('   3. Ensure database is accessible from Vercel');
  console.log('   4. Clear browser cookies and test sign-in\n');
}
