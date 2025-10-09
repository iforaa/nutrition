import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { authenticateUser } from '$lib/auth/auth';
import { setSessionCookie } from '$lib/auth/session';

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const data = await request.formData();
    const email = data.get('email')?.toString();
    const password = data.get('password')?.toString();

    if (!email || !password) {
      return fail(400, { error: 'Email и пароль обязательны' });
    }

    const user = await authenticateUser(email, password);

    if (!user) {
      return fail(401, { error: 'Неверный email или пароль' });
    }

    setSessionCookie({ cookies } as any, user.id);

    throw redirect(302, '/');
  }
};