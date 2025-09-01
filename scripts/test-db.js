#!/usr/bin/env node

/**
 * Test database connection
 */

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const prisma = new PrismaClient();

async function testConnection() {
  console.log('🔍 Testing database connection...\n');

  try {
    // Test basic connection
    console.log('1. Testing connection...');
    await prisma.$connect();
    console.log('✅ Connected to database!\n');

    // Test query
    console.log('2. Testing query...');
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Query successful!\n');

    // Check if tables exist
    console.log('3. Checking tables...');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;

    if (tables.length === 0) {
      console.log('⚠️  No tables found. Run: npx prisma db push\n');
    } else {
      console.log(`✅ Found ${tables.length} tables:`);
      tables.forEach((t) => console.log(`   - ${t.table_name}`));
      console.log();
    }

    // Check for users
    try {
      const userCount = await prisma.user.count();
      console.log(`4. User count: ${userCount}`);
    } catch (e) {
      console.log('4. User table not found (run prisma db push)');
    }

    console.log('\n✅ Database connection successful!');
    console.log('\nConnection string format verified.');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Check your DATABASE_URL in .env.local');
    console.error('2. Ensure you are using the POOLED connection (with -pooler in hostname)');
    console.error('3. Verify your password is correct');
    console.error('4. Check if Neon database is active (may pause after inactivity)');
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
