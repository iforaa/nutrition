import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/database/connection';
import { nutritionReviews } from '$lib/database/schema';
import { eq, desc, ne } from 'drizzle-orm';

// GET /api/mobile/reviews/[postId] - Get doctor reviews only (not user comments)
export const GET: RequestHandler = async ({ params }) => {
	const { postId } = params;

	if (!postId) {
		return json({ error: 'Post ID is required' }, { status: 400 });
	}

	try {
		// Get all reviews for this post, then filter out user comments
		const allReviews = await db.query.nutritionReviews.findMany({
			where: eq(nutritionReviews.postId, postId),
			orderBy: [desc(nutritionReviews.createdAt)]
		});

		// Filter out user comments (keep only doctor reviews)
		const reviews = allReviews.filter(review => !review.isUserComment);

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
