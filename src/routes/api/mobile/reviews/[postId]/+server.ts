import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/database/connection';
import { nutritionReviews } from '$lib/database/schema';
import { eq, desc } from 'drizzle-orm';

// GET /api/mobile/reviews/[postId] - Get all reviews for a specific post
export const GET: RequestHandler = async ({ params }) => {
	const { postId } = params;

	if (!postId) {
		return json({ error: 'Post ID is required' }, { status: 400 });
	}

	try {
		// Get all reviews for this post, ordered by newest first
		const reviews = await db.query.nutritionReviews.findMany({
			where: eq(nutritionReviews.postId, postId),
			orderBy: [desc(nutritionReviews.createdAt)]
		});

		if (reviews.length === 0) {
			return json({ error: 'No reviews found' }, { status: 404 });
		}

		// Return reviews array and the latest review for backward compatibility
		return json({
			reviews,
			review: reviews[0] // Latest review for backward compatibility
		});
	} catch (error) {
		console.error('Error fetching reviews:', error);
		return json({ error: 'Failed to fetch reviews' }, { status: 500 });
	}
};
