import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createUser } from '$lib/auth/auth';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return json({ error: 'Email, пароль и имя обязательны' }, { status: 400 });
    }

    if (password.length < 6) {
      return json({ error: 'Пароль должен содержать минимум 6 символов' }, { status: 400 });
    }

    // Create new user
    const user = await createUser(email, password, name);

    if (!user) {
      return json({ error: 'Не удалось создать аккаунт. Email уже может существовать.' }, { status: 400 });
    }

    // Return user data
    return json({
      userId: user.id,
      email: user.email,
      name: user.name,
      profilePicture: user.profilePicture,
    });
  } catch (error) {
    console.error('Error in mobile signup:', error);
    return json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
};
