// Script to make a user an admin
// Usage: node scripts/make-admin.js user@example.com

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';
import { users } from '../src/lib/database/schema.js';

// Get database URL from environment or use default
const DATABASE_URL = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_pkgQO4ef3SJs@ep-divine-king-agpgk8ci-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const client = postgres(DATABASE_URL);
const db = drizzle(client);

async function makeAdmin(email) {
  if (!email) {
    console.error('Usage: node scripts/make-admin.js user@example.com');
    process.exit(1);
  }

  try {
    console.log(`Looking for user with email: ${email}`);
    
    // Update user role to admin
    const result = await db
      .update(users)
      .set({ role: 'admin' })
      .where(eq(users.email, email))
      .returning();

    if (result.length === 0) {
      console.error(`❌ User with email ${email} not found`);
      process.exit(1);
    }

    console.log(`✅ Successfully made ${email} an admin!`);
    console.log(`User details:`, {
      id: result[0].id,
      name: result[0].name,
      email: result[0].email,
      role: result[0].role
    });

  } catch (error) {
    console.error('❌ Error making user admin:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

const email = process.argv[2];
makeAdmin(email);