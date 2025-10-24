import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/database/connection';
import { users } from '$lib/database/schema';
import { eq } from 'drizzle-orm';

export const GET: RequestHandler = async ({ params }) => {
  try {
    const { userId } = params;

    if (!userId) {
      return json({ error: 'userId is required' }, { status: 400 });
    }

    // Get user's questionnaire data
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      return json({ error: 'User not found' }, { status: 404 });
    }

    return json({
      questionnaire: user.questionnaire || null,
    });
  } catch (error) {
    console.error('Error loading questionnaire:', error);
    return json(
      { error: 'Failed to load questionnaire' },
      { status: 500 }
    );
  }
};
