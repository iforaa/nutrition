import { error } from '@sveltejs/kit';
import { readFile, stat } from 'fs/promises';
import { join } from 'path';
import type { RequestHandler } from './$types';
import { UPLOAD_DIR } from '$env/static/private';

export const GET: RequestHandler = async ({ params }) => {
  try {
    const filePath = join(UPLOAD_DIR, params.path);
    
    // Check if file exists
    try {
      await stat(filePath);
    } catch {
      throw error(404, 'File not found');
    }
    
    // Read the file
    const file = await readFile(filePath);
    
    // Determine content type based on file extension
    const ext = params.path.split('.').pop()?.toLowerCase();
    let contentType = 'application/octet-stream';
    
    switch (ext) {
      case 'pdf':
        contentType = 'application/pdf';
        break;
      case 'jpg':
      case 'jpeg':
        contentType = 'image/jpeg';
        break;
      case 'png':
        contentType = 'image/png';
        break;
      case 'gif':
        contentType = 'image/gif';
        break;
      case 'webp':
        contentType = 'image/webp';
        break;
    }
    
    return new Response(file as any, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      }
    });
    
  } catch (err) {
    console.error('Error serving file:', err);
    throw error(500, 'Error reading file');
  }
};