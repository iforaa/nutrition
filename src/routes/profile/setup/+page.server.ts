import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Actions } from './$types';
import { getSessionUser } from '$lib/auth/session';
import { db } from '$lib/database/connection';
import { users } from '$lib/database/schema';
import { saveUploadedFile } from '$lib/utils/file-server';

export const actions: Actions = {
  default: async (event) => {
    const user = await getSessionUser(event);
    
    if (!user) {
      throw redirect(302, '/auth/login');
    }

    const formData = await event.request.formData();
    const profilePicture = formData.get('profilePicture') as File;

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

        profilePicturePath = await saveUploadedFile(profilePicture, 'profile-pictures');
      } catch (error) {
        console.error('Error uploading profile picture:', error);
        return fail(500, { error: 'Failed to upload profile picture' });
      }
    }

    try {
      await db
        .update(users)
        .set({ 
          profilePicture: profilePicturePath,
          updatedAt: new Date()
        })
        .where(eq(users.id, user.id));

      throw redirect(302, '/');
    } catch (error) {
      console.error('Error updating user profile:', error);
      return fail(500, { error: 'Failed to update profile' });
    }
  }
};