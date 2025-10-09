import { fail } from '@sveltejs/kit';
import { eq, desc } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/database/connection';
import { posts, nutritionReviews, users } from '$lib/database/schema';
import { requireAdmin } from '$lib/auth/admin';

export const load: PageServerLoad = async (event) => {
  // Require admin access
  await requireAdmin(event);

  // Get all posts with user information and reviews using Drizzle relations
  const allPosts = await db.query.posts.findMany({
    orderBy: [desc(posts.createdAt)],
    with: {
      user: true,
      reviews: true
    }
  });

  return {
    posts: allPosts
  };
};

export const actions: Actions = {
  addReview: async ({ request }) => {
    const formData = await request.formData();
    const postId = formData.get('postId')?.toString();
    const reviewText = formData.get('reviewText')?.toString();

    if (!postId || !reviewText) {
      return fail(400, { error: 'All fields are required' });
    }

    try {
      // Verify post exists
      const post = await db.query.posts.findFirst({
        where: eq(posts.id, postId)
      });

      if (!post) {
        return fail(404, { error: 'Post not found' });
      }

      // Insert the review
      await db.insert(nutritionReviews).values({
        postId,
        reviewData: { text: reviewText }
      });

      return { success: true };

    } catch (error) {
      console.error('Error adding review:', error);
      return fail(500, { error: 'Failed to add review' });
    }
  }
};
