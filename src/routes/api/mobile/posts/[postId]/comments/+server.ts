import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/database/connection';
import { nutritionReviews, users, posts } from '$lib/database/schema';
import { eq, desc, and } from 'drizzle-orm';

// GET /api/mobile/posts/[postId]/comments - Get user comments for a post (not doctor reviews)
export const GET: RequestHandler = async ({ params }) => {
  try {
    const { postId } = params;

    const comments = await db.query.nutritionReviews.findMany({
      where: and(
        eq(nutritionReviews.postId, postId),
        eq(nutritionReviews.isUserComment, true)
      ),
      orderBy: [desc(nutritionReviews.createdAt)],
      with: {
        user: true
      }
    });

    const transformedComments = comments.map(comment => ({
      id: comment.id,
      commentText: typeof comment.reviewData === 'object' && comment.reviewData?.text
        ? comment.reviewData.text
        : (typeof comment.reviewData === 'string' ? comment.reviewData : ''),
      userName: comment.user?.name || comment.reviewerName,
      userId: comment.userId,
      createdAt: comment.createdAt.toISOString()
    }));

    return json({ comments: transformedComments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
};

// POST /api/mobile/posts/[postId]/comments - Add a user comment to a post
export const POST: RequestHandler = async ({ params, request }) => {
  try {
    const { postId } = params;
    const { email, commentText } = await request.json();

    if (!email || !commentText) {
      return json({ error: 'Email and comment text are required' }, { status: 400 });
    }

    // Check if post allows comments
    const post = await db.query.posts.findFirst({
      where: eq(posts.id, postId)
    });

    if (!post) {
      return json({ error: 'Post not found' }, { status: 404 });
    }

    if (post.commentsAllowed === false) {
      return json({ error: 'Comments are not allowed on this post' }, { status: 403 });
    }

    // Find user by email
    const user = await db.query.users.findFirst({
      where: eq(users.email, email)
    });

    if (!user) {
      return json({ error: 'User not found' }, { status: 404 });
    }

    // Create comment as a nutrition_review with isUserComment = true
    const [newComment] = await db
      .insert(nutritionReviews)
      .values({
        postId,
        userId: user.id,
        reviewerName: user.name,
        reviewData: { text: commentText },
        isUserComment: true
      })
      .returning();

    return json({
      comment: {
        id: newComment.id,
        commentText,
        userName: user.name,
        createdAt: newComment.createdAt.toISOString()
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return json({ error: 'Failed to create comment' }, { status: 500 });
  }
};
