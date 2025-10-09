import { SESSION_SECRET } from '$env/static/private';
import type { RequestEvent } from '@sveltejs/kit';
import { getUserById } from './auth';
import type { User } from '$lib/database/schema';

interface SessionData {
  userId: string;
  expires: number;
}

function encodeSession(data: SessionData): string {
  return Buffer.from(JSON.stringify(data)).toString('base64');
}

function decodeSession(sessionString: string): SessionData | null {
  try {
    const decoded = Buffer.from(sessionString, 'base64').toString('utf-8');
    const data = JSON.parse(decoded) as SessionData;
    
    if (data.expires < Date.now()) {
      return null;
    }
    
    return data;
  } catch {
    return null;
  }
}

export function createSession(userId: string): string {
  const sessionData: SessionData = {
    userId,
    expires: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
  };
  
  return encodeSession(sessionData);
}

export async function getSessionUser(event: RequestEvent): Promise<User | null> {
  const sessionCookie = event.cookies.get('session');
  
  if (!sessionCookie) {
    return null;
  }
  
  const sessionData = decodeSession(sessionCookie);
  
  if (!sessionData) {
    return null;
  }
  
  return await getUserById(sessionData.userId);
}

export function setSessionCookie(event: RequestEvent, userId: string) {
  const session = createSession(userId);
  
  event.cookies.set('session', session, {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

export function clearSessionCookie(event: RequestEvent) {
  event.cookies.delete('session', {
    path: '/',
  });
}