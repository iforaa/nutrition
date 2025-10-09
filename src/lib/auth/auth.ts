import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '$lib/database/connection';
import { users, type User, type NewUser } from '$lib/database/schema';

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export async function createUser(email: string, password: string, name: string): Promise<User | null> {
  try {
    const passwordHash = await hashPassword(password);
    const newUser: NewUser = {
      email,
      passwordHash,
      name,
    };

    const [user] = await db.insert(users).values(newUser).returning();
    return user;
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  try {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    
    if (!user) {
      return null;
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Error authenticating user:', error);
    return null;
  }
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || null;
  } catch (error) {
    console.error('Error getting user by id:', error);
    return null;
  }
}