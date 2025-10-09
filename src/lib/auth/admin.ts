import { redirect } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { getSessionUser } from './session';

export async function requireAdmin(event: RequestEvent) {
  const user = await getSessionUser(event);
  
  if (!user) {
    throw redirect(302, '/auth/login');
  }
  
  if (user.role !== 'admin') {
    throw redirect(302, '/auth/login');
  }
  
  return user;
}