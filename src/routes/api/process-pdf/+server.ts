import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSessionUser } from '$lib/auth/session';
import { db } from '$lib/database/connection';
import { files } from '$lib/database/schema';
import { eq } from 'drizzle-orm';
import { processPdfFile } from '$lib/services/pdf-processor';
import path from 'path';

export const POST: RequestHandler = async (event) => {
  try {
    const user = await getSessionUser(event);
    
    if (!user) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Only allow admins to manually process PDFs
    if (user.role !== 'admin') {
      return json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const { fileId } = await event.request.json();
    
    if (!fileId) {
      return json({ error: 'File ID is required' }, { status: 400 });
    }
    
    // Get the file from database
    const [file] = await db
      .select()
      .from(files)
      .where(eq(files.id, fileId));
    
    if (!file) {
      return json({ error: 'File not found' }, { status: 404 });
    }
    
    if (file.fileType !== 'pdf') {
      return json({ error: 'File is not a PDF' }, { status: 400 });
    }
    
    // Process the PDF
    const absolutePath = path.resolve(file.filePath);
    const extractedData = await processPdfFile(absolutePath);
    
    // Update the database
    const [updatedFile] = await db.update(files)
      .set({
        processed: true,
        extractedData: extractedData
      })
      .where(eq(files.id, fileId))
      .returning();
    
    return json({
      success: true,
      file: updatedFile,
      extractedData: extractedData
    });
    
  } catch (error) {
    console.error('Error processing PDF:', error);
    return json(
      { 
        error: 'Processing failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }, 
      { status: 500 }
    );
  }
};