import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/database/connection';
import { posts, nutritionReviews, users } from '$lib/database/schema';
import { eq, desc } from 'drizzle-orm';

// Helper function to determine post type
function getPostType(post: any): 'image' | 'pdf' {
	if (post.photos && post.photos.length > 0) return 'image';
	if (post.content) {
		if (typeof post.content === 'string' && post.content.toLowerCase().endsWith('.pdf')) return 'pdf';
		return 'image';
	}
	return 'image'; // Default for text-only posts
}

// GET /api/mobile/posts - Get all posts for a user
export const GET: RequestHandler = async ({ url }) => {
	const userEmail = url.searchParams.get('email');

	if (!userEmail) {
		return json({ error: 'Email parameter is required' }, { status: 400 });
	}

	try {
		// Find user by email
		const user = await db.query.users.findFirst({
			where: eq(users.email, userEmail)
		});

		if (!user) {
			return json({ error: 'User not found' }, { status: 404 });
		}

		// Get posts for user with reviews
		const userPosts = await db.query.posts.findMany({
			where: eq(posts.userId, user.id),
			orderBy: [desc(posts.createdAt)],
			with: {
				reviews: true
			}
		});

		// Transform to mobile app format
		const transformedPosts = userPosts.map(post => ({
			id: post.id,
			type: getPostType(post),
			content: post.content || '',
			title: post.title,
			date: formatDate(post.createdAt),
			testId: post.testId,
			hasReview: post.reviews.length > 0,
			reviewId: post.reviews[0]?.id,
			photos: post.photos as string[] | undefined,
			description: post.description,
			commentsAllowed: post.commentsAllowed !== false,
			tag: post.tag,
			happenedAt: post.happenedAt?.toISOString() || null
		}));

		return json({ posts: transformedPosts });
	} catch (error) {
		console.error('Error fetching posts:', error);
		return json({ error: 'Failed to fetch posts' }, { status: 500 });
	}
};

// POST /api/mobile/posts - Create a new post
export const POST: RequestHandler = async ({ request }) => {
	try {
		const data = await request.json();
		const { email, title, content, testId } = data;

		if (!email || !title) {
			return json({ error: 'Missing required fields' }, { status: 400 });
		}

		// Find user by email
		const user = await db.query.users.findFirst({
			where: eq(users.email, email)
		});

		if (!user) {
			return json({ error: 'User not found' }, { status: 404 });
		}

		// Create post
		const [newPost] = await db
			.insert(posts)
			.values({
				userId: user.id,
				title,
				content: content || null,
				testId: testId || null,
				processed: false
			})
			.returning();

		return json({ post: newPost }, { status: 201 });
	} catch (error) {
		console.error('Error creating post:', error);
		return json({ error: 'Failed to create post' }, { status: 500 });
	}
};

function formatDate(date: Date): string {
	const now = new Date();
	const diff = now.getTime() - date.getTime();
	const minutes = Math.floor(diff / 60000);
	const hours = Math.floor(diff / 3600000);
	const days = Math.floor(diff / 86400000);

	if (minutes < 60) {
		return `${minutes} минут назад`;
	} else if (hours < 24) {
		return `${hours} часов назад`;
	} else if (days === 1) {
		return 'Вчера';
	} else if (days < 7) {
		// Show day of week for recent posts (within a week)
		const dayNames = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
		const dayName = dayNames[date.getDay()];
		return dayName;
	} else {
		// Show full date with day of week for older posts
		const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
		const dayName = dayNames[date.getDay()];
		const day = date.getDate().toString().padStart(2, '0');
		const month = (date.getMonth() + 1).toString().padStart(2, '0');
		const year = date.getFullYear();
		return `${dayName}, ${day}.${month}.${year}`;
	}
}
