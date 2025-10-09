import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { createUser } from '$lib/auth/auth';
import { setSessionCookie } from '$lib/auth/session';

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const data = await request.formData();
    const email = data.get('email')?.toString();
    const password = data.get('password')?.toString();
    const confirmPassword = data.get('confirmPassword')?.toString();
    const name = data.get('name')?.toString();

    if (!email || !password || !confirmPassword || !name) {
      return fail(400, { error: 'Все поля обязательны' });
    }

    if (password !== confirmPassword) {
      return fail(400, { error: 'Пароли не совпадают' });
    }

    if (password.length < 6) {
      return fail(400, { error: 'Пароль должен содержать минимум 6 символов' });
    }

    const user = await createUser(email, password, name);

    if (!user) {
      return fail(400, { error: 'Не удалось создать аккаунт. Email уже может существовать.' });
    }

    setSessionCookie({ cookies } as any, user.id);
    
    throw redirect(302, '/profile/setup');
  }
};