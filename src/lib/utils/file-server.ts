// Server-side file utilities
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { UPLOAD_DIR } from '$env/static/private';

export async function saveUploadedFile(file: File, folder: string = 'general'): Promise<string> {
  const uploadPath = join(UPLOAD_DIR, folder);
  
  // Ensure directory exists
  await mkdir(uploadPath, { recursive: true });
  
  // Generate unique filename
  const fileExt = file.name.split('.').pop();
  const filename = `${uuidv4()}.${fileExt}`;
  const filePath = join(uploadPath, filename);
  
  // Convert file to buffer and save
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);
  
  // Return relative path from uploads directory
  return join(folder, filename);
}

export function isValidImageType(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  return validTypes.includes(file.type);
}

export function isValidPdfType(file: File): boolean {
  return file.type === 'application/pdf';
}

export function isValidFileSize(file: File, maxSizeBytes: number = 10 * 1024 * 1024): boolean {
  return file.size <= maxSizeBytes;
}