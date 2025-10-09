import { fail } from '@sveltejs/kit';
import { eq, desc } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/database/connection';
import { posts, nutritionReviews, users } from '$lib/database/schema';
import { requireAdmin } from '$lib/auth/admin';

export const load: PageServerLoad = async (event) => {
  // Require admin access
  await requireAdmin(event);

  const { userId } = event.params;

  // Get user info
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId)
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Get all posts for this user with reviews
  const userPosts = await db.query.posts.findMany({
    where: eq(posts.userId, userId),
    orderBy: [desc(posts.createdAt)],
    with: {
      reviews: {
        orderBy: [desc(nutritionReviews.createdAt)]
      }
    }
  });

  return {
    user,
    posts: userPosts
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
  },

  extractPDF: async ({ request }) => {
    console.log('=== extractPDF action started ===');
    const formData = await request.formData();
    const postId = formData.get('postId')?.toString();
    console.log('Post ID:', postId);

    if (!postId) {
      console.error('No post ID provided');
      return fail(400, { error: 'Post ID is required' });
    }

    try {
      // Get the post
      console.log('Fetching post from database...');
      const post = await db.query.posts.findFirst({
        where: eq(posts.id, postId)
      });

      console.log('Post found:', post ? `${post.id} - ${post.title}` : 'NOT FOUND');

      if (!post) {
        console.error('Post not found in database');
        return fail(404, { error: 'Post not found' });
      }

      if (post.type !== 'pdf') {
        console.error('Post is not a PDF, type:', post.type);
        return fail(400, { error: 'Post is not a PDF' });
      }

      console.log('PDF path:', post.content);
      console.log('Importing OpenAI extraction function...');

      // Import the OpenAI extraction function
      const { extractTestDataFromPDF } = await import('$lib/ai/openai');

      console.log('Calling extractTestDataFromPDF...');
      // Extract data from PDF
      const extractedData = await extractTestDataFromPDF(post.content);

      console.log('Extraction successful! Data:', JSON.stringify(extractedData, null, 2));

      // Update the post with extracted data
      console.log('Updating post in database...');
      await db
        .update(posts)
        .set({
          extractedData: extractedData as any,
          processed: true
        })
        .where(eq(posts.id, postId));

      console.log('Database updated successfully');
      console.log('=== extractPDF action completed successfully ===');
      return { success: true, extracted: true };

    } catch (error) {
      console.error('=== ERROR in extractPDF action ===');
      console.error('Error type:', error instanceof Error ? error.name : typeof error);
      console.error('Error message:', error instanceof Error ? error.message : String(error));
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      console.error('Full error object:', error);
      return fail(500, {
        error: error instanceof Error ? error.message : 'Failed to extract PDF data',
        details: error instanceof Error ? error.stack : String(error)
      });
    }
  },

  deleteExtractedData: async ({ request }) => {
    console.log('=== deleteExtractedData action started ===');
    const formData = await request.formData();
    const postId = formData.get('postId')?.toString();
    console.log('Post ID:', postId);

    if (!postId) {
      console.error('No post ID provided');
      return fail(400, { error: 'Post ID is required' });
    }

    try {
      console.log('Deleting extracted data from post...');

      // Update the post to remove extracted data
      await db
        .update(posts)
        .set({
          extractedData: null,
          processed: false
        })
        .where(eq(posts.id, postId));

      console.log('Extracted data deleted successfully');
      console.log('=== deleteExtractedData action completed successfully ===');
      return { success: true, deleted: true };

    } catch (error) {
      console.error('=== ERROR in deleteExtractedData action ===');
      console.error('Error:', error);
      return fail(500, {
        error: error instanceof Error ? error.message : 'Failed to delete extracted data'
      });
    }
  },

  analyzeFood: async ({ request }) => {
    console.log('=== analyzeFood action started ===');
    const formData = await request.formData();
    const postId = formData.get('postId')?.toString();
    console.log('Post ID:', postId);

    if (!postId) {
      console.error('No post ID provided');
      return fail(400, { error: 'Post ID is required' });
    }

    try {
      // Get the post
      console.log('Fetching post from database...');
      const post = await db.query.posts.findFirst({
        where: eq(posts.id, postId)
      });

      console.log('Post found:', post ? `${post.id} - ${post.title}` : 'NOT FOUND');

      if (!post) {
        console.error('Post not found in database');
        return fail(404, { error: 'Post not found' });
      }

      if (post.type !== 'image') {
        console.error('Post is not an image, type:', post.type);
        return fail(400, { error: 'Post is not an image' });
      }

      console.log('Image path:', post.content);
      console.log('Importing OpenAI food analysis function...');

      // Import the OpenAI food analysis function
      const { analyzeFoodFromImage } = await import('$lib/ai/openai');

      console.log('Calling analyzeFoodFromImage...');
      // Analyze food from image
      const foodData = await analyzeFoodFromImage(post.content);

      console.log('Analysis successful! Data:', JSON.stringify(foodData, null, 2));

      // Update the post with food data
      console.log('Updating post in database...');
      await db
        .update(posts)
        .set({
          extractedData: foodData as any,
          processed: true
        })
        .where(eq(posts.id, postId));

      console.log('Database updated successfully');
      console.log('=== analyzeFood action completed successfully ===');
      return { success: true, analyzed: true };

    } catch (error) {
      console.error('=== ERROR in analyzeFood action ===');
      console.error('Error type:', error instanceof Error ? error.name : typeof error);
      console.error('Error message:', error instanceof Error ? error.message : String(error));
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      console.error('Full error object:', error);
      return fail(500, {
        error: error instanceof Error ? error.message : 'Failed to analyze food',
        details: error instanceof Error ? error.stack : String(error)
      });
    }
  }
};
