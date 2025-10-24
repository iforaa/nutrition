import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const CLOUDFLARE_WORKER_URL = 'https://orange-voice-eda1.igor-n-kuz8044.workers.dev';

// POST /api/mobile/upload-file - Upload file to Cloudflare R2 without creating a post
export const POST: RequestHandler = async ({ request }) => {
	try {
		const formData = await request.formData();
		const file = formData.get('file') as File;

		if (!file) {
			return json({ error: 'File is required' }, { status: 400 });
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

		return json({
			url: uploadResult.url
		}, { status: 200 });
	} catch (error) {
		console.error('Error uploading file:', error);
		return json({ error: 'Failed to upload file' }, { status: 500 });
	}
};
