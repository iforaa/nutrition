import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { authenticateUser } from '$lib/auth/auth';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return json({ error: 'Email и пароль обязательны' }, { status: 400 });
    }

    // Authenticate user with password
    const user = await authenticateUser(email, password);

    if (!user) {
      return json({ error: 'Неверный email или пароль' }, { status: 401 });
    }

    // Return user data
    return json({
      userId: user.id,
      email: user.email,
      name: user.name,
      profilePicture: user.profilePicture,
    });
  } catch (error) {
    console.error('Error in mobile login:', error);
    return json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
};
