import { eq } from 'drizzle-orm';
import { db } from '$lib/database/connection';
import { posts } from '$lib/database/schema';
import { processPdfFile } from '$lib/ai/pdf-parser';

export async function processPendingPdfs(): Promise<void> {
  try {
    // Get unprocessed PDF posts using query API
    const pendingPdfs = await db.query.posts.findMany({
      where: eq(posts.processed, false),
      limit: 10
    });

    console.log(`Found ${pendingPdfs.length} pending PDFs to process`);

    for (const post of pendingPdfs) {
      if (post.type !== 'pdf') {
        // Mark non-PDF posts as processed (images don't need AI processing)
        await db
          .update(posts)
          .set({ processed: true })
          .where(eq(posts.id, post.id));
        continue;
      }

      try {
        console.log(`Processing PDF: ${post.title}`);

        // Process the PDF
        const extractedData = await processPdfFile(post.content);

        // Update the post record with extracted data
        await db
          .update(posts)
          .set({
            processed: true,
            extractedData: extractedData as any // Cast to match jsonb type
          })
          .where(eq(posts.id, post.id));

        console.log(`Successfully processed PDF: ${post.title}`);

      } catch (error) {
        console.error(`Error processing PDF ${post.title}:`, error);

        // Mark as processed but with error in extracted data
        await db
          .update(posts)
          .set({
            processed: true,
            extractedData: {
              error: 'Failed to process PDF',
              rawText: null,
              summary: 'Processing failed - manual review required'
            } as any
          })
          .where(eq(posts.id, post.id));
      }
    }

  } catch (error) {
    console.error('Error in processPendingPdfs:', error);
  }
}

// Function to start the background processor
export function startPdfProcessor(): void {
  console.log('Starting PDF processor...');
  
  // Process immediately on startup
  processPendingPdfs();
  
  // Then process every 30 seconds
  setInterval(processPendingPdfs, 30000);
}