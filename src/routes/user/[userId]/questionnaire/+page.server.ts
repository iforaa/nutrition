import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { db } from '$lib/database/connection';
import { users } from '$lib/database/schema';
import { requireAdmin } from '$lib/auth/admin';

export const load: PageServerLoad = async (event) => {
  // Require admin access
  await requireAdmin(event);

  const { userId } = event.params;

  // Get user info with questionnaire
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId)
  });

  if (!user) {
    throw new Error('User not found');
  }

  return {
    user
  };
};
