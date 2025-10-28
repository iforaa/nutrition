import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/database/connection';
import { posts } from '$lib/database/schema';
import { eq } from 'drizzle-orm';

export const PATCH: RequestHandler = async ({ params, request }) => {
  try {
    const { postId } = params;
    const body = await request.json();
    const { tag, commentsAllowed } = body;

    const updateData: any = {};

    if (tag !== undefined) {
      updateData.tag = tag;
    }

    if (commentsAllowed !== undefined) {
      updateData.commentsAllowed = commentsAllowed;
    }

    if (Object.keys(updateData).length === 0) {
      return json({ error: 'No valid fields to update' }, { status: 400 });
    }

    updateData.updatedAt = new Date();

    await db
      .update(posts)
      .set(updateData)
      .where(eq(posts.id, postId));

    return json({ success: true });
  } catch (error) {
    console.error('Error updating post settings:', error);
    return json(
      { error: 'Failed to update post settings' },
      { status: 500 }
    );
  }
};
