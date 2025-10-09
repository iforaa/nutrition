import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { clearSessionCookie } from '$lib/auth/session';

export const load: PageServerLoad = async ({ cookies }) => {
  clearSessionCookie({ cookies } as any);
  throw redirect(302, '/auth/login');
};