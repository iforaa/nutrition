import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { getSessionUser } from '$lib/auth/session';
import { db } from '$lib/database/connection';
import { users } from '$lib/database/schema';

const CLOUDFLARE_WORKER_URL = 'https://orange-voice-eda1.igor-n-kuz8044.workers.dev';

export const load: PageServerLoad = async (event) => {
  const user = await getSessionUser(event);
  
  if (!user) {
    throw redirect(302, '/auth/login');
  }

  return {
    user
  };
};

export const actions: Actions = {
  default: async (event) => {
    const user = await getSessionUser(event);
    
    if (!user) {
      throw redirect(302, '/auth/login');
    }

    const formData = await event.request.formData();
    const name = formData.get('name')?.toString();
    const profilePicture = formData.get('profilePicture') as File;

    if (!name) {
      return fail(400, { error: 'Name is required' });
    }

    let profilePicturePath = user.profilePicture;

    if (profilePicture && profilePicture.size > 0) {
      try {
        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(profilePicture.type)) {
          return fail(400, { error: 'Invalid file type. Please use JPEG, PNG, GIF, or WebP.' });
        }

        // Validate file size (5MB max)
        if (profilePicture.size > 5 * 1024 * 1024) {
          return fail(400, { error: 'File too large. Maximum size is 5MB.' });
        }

        // Upload to Cloudflare
        const uploadFormData = new FormData();
        uploadFormData.append('file', profilePicture);

        const uploadResponse = await fetch(`${CLOUDFLARE_WORKER_URL}/upload`, {
          method: 'POST',
          body: uploadFormData,
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload to Cloudflare');
        }

        const uploadResult = await uploadResponse.json();
        profilePicturePath = uploadResult.url;
      } catch (error) {
        console.error('Error uploading profile picture:', error);
        return fail(500, { error: 'Failed to upload profile picture' });
      }
    }

    try {
      await db
        .update(users)
        .set({ 
          name,
          profilePicture: profilePicturePath,
          updatedAt: new Date()
        })
        .where(eq(users.id, user.id));

      return { success: true };
    } catch (error) {
      console.error('Error updating user profile:', error);
      return fail(500, { error: 'Failed to update profile' });
    }
  }
};