// Client-side file utilities (safe for browser)

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