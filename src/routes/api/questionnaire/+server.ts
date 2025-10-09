import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/database/connection';
import { users } from '$lib/database/schema';
import { eq } from 'drizzle-orm';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { userId, questionnaire } = await request.json();

    if (!userId || !questionnaire) {
      return json({ error: 'userId and questionnaire are required' }, { status: 400 });
    }

    // Update user with questionnaire data
    await db
      .update(users)
      .set({
        questionnaire: questionnaire,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));

    return json({ success: true });
  } catch (error) {
    console.error('Error saving questionnaire:', error);
    return json(
      { error: 'Failed to save questionnaire' },
      { status: 500 }
    );
  }
};
