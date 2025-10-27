import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/database/connection';
import { posts, nutritionReviews, users } from '$lib/database/schema';
import { eq } from 'drizzle-orm';

export const GET: RequestHandler = async ({ params }) => {
  try {
    const { postId } = params;

    if (!postId) {
      return json({ error: 'postId is required' }, { status: 400 });
    }

    const [post] = await db.select().from(posts).where(eq(posts.id, postId));

    if (!post) {
      return json({ error: 'Post not found' }, { status: 404 });
    }

    return json({ post });
  } catch (error) {
    console.error('Error fetching post:', error);
    return json({ error: 'Failed to fetch post' }, { status: 500 });
  }
};

export const PATCH: RequestHandler = async ({ params, request }) => {
  try {
    const { postId } = params;

    if (!postId) {
      return json({ error: 'postId is required' }, { status: 400 });
    }

    const { title, photos, description } = await request.json();

    // Build update object with only provided fields
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (title !== undefined) updateData.title = title;
    if (photos !== undefined) updateData.photos = photos;
    if (description !== undefined) updateData.description = description;

    const [updatedPost] = await db
      .update(posts)
      .set(updateData)
      .where(eq(posts.id, postId))
      .returning();

    if (!updatedPost) {
      return json({ error: 'Post not found' }, { status: 404 });
    }

    return json({ post: updatedPost });
  } catch (error) {
    console.error('Error updating post:', error);
    return json({ error: 'Failed to update post' }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ params, request }) => {
  try {
    const { postId } = params;
    const { email } = await request.json();

    if (!postId) {
      return json({ error: 'postId is required' }, { status: 400 });
    }

    if (!email) {
      return json({ error: 'email is required' }, { status: 400 });
    }

    // Get the post to check ownership
    const [post] = await db.select().from(posts).where(eq(posts.id, postId));

    if (!post) {
      return json({ error: 'Post not found' }, { status: 404 });
    }

    // Get user by email
    const [user] = await db.select().from(users).where(eq(users.email, email));

    if (!user) {
      return json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user owns the post
    if (post.userId !== user.id) {
      return json({ error: 'You can only delete your own posts' }, { status: 403 });
    }

    // Delete all reviews associated with the post
    await db.delete(nutritionReviews).where(eq(nutritionReviews.postId, postId));

    // Delete the post
    await db.delete(posts).where(eq(posts.id, postId));

    return json({ success: true });
  } catch (error) {
    console.error('Error deleting post:', error);
    return json({ error: 'Failed to delete post' }, { status: 500 });
  }
};
