import { startPdfProcessor } from '$lib/jobs/pdf-processor';

// Start background PDF processor when the app initializes
if (typeof window === 'undefined') {
  // Only run on server side
  startPdfProcessor();
}