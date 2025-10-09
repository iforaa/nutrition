import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { getSessionUser } from '$lib/auth/session';
import { db } from '$lib/database/connection';
import { files } from '$lib/database/schema';
import { saveUploadedFile, isValidImageType, isValidPdfType, isValidFileSize } from '$lib/utils/file-server';
import { processPdfFile } from '$lib/services/pdf-processor';
import { eq } from 'drizzle-orm';
import path from 'path';

export const actions: Actions = {
  default: async (event) => {
    const user = await getSessionUser(event);
    
    if (!user) {
      throw redirect(302, '/auth/login');
    }

    const formData = await event.request.formData();
    const uploadedFiles = formData.getAll('files') as File[];

    if (!uploadedFiles || uploadedFiles.length === 0) {
      return fail(400, { error: 'Файлы не выбраны' });
    }

    const results = [];
    const errors = [];

    for (const file of uploadedFiles) {
      if (file.size === 0) continue; // Skip empty files
      
      try {
        // Validate file type
        const isPdf = isValidPdfType(file);
        const isImage = isValidImageType(file);
        
        if (!isPdf && !isImage) {
          errors.push(`Недопустимый тип файла для "${file.name}". Разрешены только PDF и изображения.`);
          continue;
        }
        
        // Validate file size (10MB max)
        if (!isValidFileSize(file, 10 * 1024 * 1024)) {
          errors.push(`Файл "${file.name}" слишком большой. Максимальный размер 10МБ.`);
          continue;
        }

        // Determine file type and save to appropriate folder
        const fileType = isPdf ? 'pdf' : 'image';
        const folder = isPdf ? 'medical-tests' : 'food-photos';
        
        const savedPath = await saveUploadedFile(file, folder);
        
        // Save file record to database
        const [savedFile] = await db.insert(files).values({
          userId: user.id,
          filename: file.name,
          fileType,
          filePath: savedPath,
          processed: false,
          extractedData: null
        }).returning();
        
        // If it's a PDF, process it with AI in the background
        if (fileType === 'pdf') {
          // Process PDF asynchronously - don't wait for it to complete
          processPdfInBackground(savedFile.id, savedPath);
        }
        
        results.push(savedFile);
        
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        errors.push(`Не удалось загрузить "${file.name}"`);
      }
    }

    if (errors.length > 0 && results.length === 0) {
      return fail(400, { error: errors.join('. ') });
    }

    if (errors.length > 0) {
      // Partial success - some files uploaded, some failed
      return {
        success: true,
        warning: `${results.length} файл(ов) загружено успешно. ${errors.join('. ')}`
      };
    }

    // All files uploaded successfully
    throw redirect(302, '/');
  }
};

// Background PDF processing function
async function processPdfInBackground(fileId: string, filePath: string) {
  try {
    console.log(`Starting background processing for file ${fileId} at ${filePath}`);
    
    // Get the absolute path to the file
    const absolutePath = path.resolve(filePath);
    
    // Process the PDF with AI
    const extractedData = await processPdfFile(absolutePath);
    
    // Update the database with extracted data
    await db.update(files)
      .set({
        processed: true,
        extractedData: extractedData
      })
      .where(eq(files.id, fileId));
    
    console.log(`Successfully processed PDF file ${fileId}`);
    
  } catch (error) {
    console.error(`Error processing PDF file ${fileId}:`, error);
    
    // Mark as processed but with error
    await db.update(files)
      .set({
        processed: true,
        extractedData: {
          error: 'Processing failed',
          message: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      })
      .where(eq(files.id, fileId));
  }
}