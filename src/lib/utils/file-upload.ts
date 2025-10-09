// Server-only functions (only available on server-side)
export async function saveUploadedFile(file: File, folder: string = 'general'): Promise<string> {
  // This function should only be called server-side
  if (typeof window !== 'undefined') {
    throw new Error('saveUploadedFile can only be called server-side');
  }
  
  const { writeFile, mkdir } = await import('fs/promises');
  const { join } = await import('path');
  const { v4: uuidv4 } = await import('uuid');
  const { UPLOAD_DIR } = await import('$env/static/private');
  
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

export function getFileUrl(relativePath: string): string {
  return `/uploads/${relativePath}`;
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