import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/database/connection';
import { nutritionReviews, users } from '$lib/database/schema';
import { eq, and } from 'drizzle-orm';

// DELETE /api/mobile/posts/[postId]/comments/[commentId] - Delete a user comment
export const DELETE: RequestHandler = async ({ params, request }) => {
	try {
		const { commentId } = params;
		const { email } = await request.json();

		if (!commentId) {
			return json({ error: 'commentId is required' }, { status: 400 });
		}

		if (!email) {
			return json({ error: 'email is required' }, { status: 400 });
		}

		// Find user by email
		const user = await db.query.users.findFirst({
			where: eq(users.email, email)
		});

		if (!user) {
			return json({ error: 'User not found' }, { status: 404 });
		}

		// Find the comment and verify ownership
		const comment = await db.query.nutritionReviews.findFirst({
			where: eq(nutritionReviews.id, commentId)
		});

		if (!comment) {
			return json({ error: 'Comment not found' }, { status: 404 });
		}

		// Check if user owns the comment
		if (comment.userId !== user.id) {
			return json({ error: 'You can only delete your own comments' }, { status: 403 });
		}

		// Delete the comment
		await db.delete(nutritionReviews).where(eq(nutritionReviews.id, commentId));

		return json({ success: true });
	} catch (error) {
		console.error('Error deleting comment:', error);
		return json({ error: 'Failed to delete comment' }, { status: 500 });
	}
};
