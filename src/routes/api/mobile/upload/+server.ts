import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/database/connection';
import { posts, users } from '$lib/database/schema';
import { eq } from 'drizzle-orm';

const CLOUDFLARE_WORKER_URL = 'https://orange-voice-eda1.igor-n-kuz8044.workers.dev';

// POST /api/mobile/upload - Upload image or PDF to Cloudflare R2
export const POST: RequestHandler = async ({ request }) => {
	try {
		const formData = await request.formData();
		const file = formData.get('file') as File;
		const email = formData.get('email') as string;
		const title = formData.get('title') as string;
		const type = formData.get('type') as string;
		const testId = formData.get('testId') as string | null;
		const happenedAt = formData.get('happenedAt') as string | null;

		if (!file || !email || !title || !type) {
			return json({ error: 'Missing required fields' }, { status: 400 });
		}

		// Find user
		const user = await db.query.users.findFirst({
			where: eq(users.email, email)
		});

		if (!user) {
			return json({ error: 'User not found' }, { status: 404 });
		}

		// Upload file to Cloudflare Worker
		const uploadFormData = new FormData();
		uploadFormData.append('file', file);

		const uploadResponse = await fetch(`${CLOUDFLARE_WORKER_URL}/upload`, {
			method: 'POST',
			body: uploadFormData,
		});

		if (!uploadResponse.ok) {
			const errorText = await uploadResponse.text();
			console.error('Cloudflare upload error:', errorText);
			return json({ error: 'Failed to upload to Cloudflare' }, { status: 500 });
		}

		const uploadResult = await uploadResponse.json();
		const fileUrl = uploadResult.url;

		// Create post in database
		const [newPost] = await db
			.insert(posts)
			.values({
				userId: user.id,
				title,
				type,
				content: fileUrl, // Store Cloudflare URL
				testId: testId || null,
				happenedAt: happenedAt ? new Date(happenedAt) : null,
				processed: false
			})
			.returning();

		return json({
			post: newPost,
			url: fileUrl
		}, { status: 201 });
	} catch (error) {
		console.error('Error uploading file:', error);
		return json({ error: 'Failed to upload file' }, { status: 500 });
	}
};
