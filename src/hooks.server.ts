import type { Handle } from '@sveltejs/kit';

// Disable CSRF protection for mobile API endpoints
export const handle: Handle = async ({ event, resolve }) => {
	if (event.url.pathname.startsWith('/api/mobile')) {
		event.request.headers.delete('origin');
	}

	return resolve(event);
};