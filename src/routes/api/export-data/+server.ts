import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSessionUser } from '$lib/auth/session';
import { db } from '$lib/database/connection';
import { files, users } from '$lib/database/schema';
import { eq } from 'drizzle-orm';
import type { ExtractedMedicalData, MedicalTestResult } from '$lib/services/pdf-processor';

interface FlattenedTestResult {
  fileId: string;
  filename: string;
  patientName?: string;
  patientAge?: number;
  patientGender?: string;
  testType: string;
  testDate?: string;
  laboratory?: string;
  doctorName?: string;
  uploadDate: string;
  parameter: string;
  value: string | number;
  unit?: string;
  referenceRange?: string;
  status: string;
  notes?: string;
  confidence: number;
  processingTime: number;
  extractionDate: string;
}

export const GET: RequestHandler = async (event) => {
  try {
    const user = await getSessionUser(event);
    
    if (!user) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Only allow admins to export data
    if (user.role !== 'admin') {
      return json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const url = new URL(event.request.url);
    const format = url.searchParams.get('format') || 'json';
    
    // Get all processed PDF files with extracted data
    const processedFiles = await db
      .select({
        id: files.id,
        filename: files.filename,
        extractedData: files.extractedData,
        uploadDate: files.uploadDate,
        userId: files.userId
      })
      .from(files)
      .where(eq(files.fileType, 'pdf'))
      .where(eq(files.processed, true));
    
    // Flatten the data for Excel-like table
    const flattenedData: FlattenedTestResult[] = [];
    
    for (const file of processedFiles) {
      if (!file.extractedData || typeof file.extractedData !== 'object') {
        continue;
      }
      
      const extractedData = file.extractedData as ExtractedMedicalData;
      
      // Skip if there's an error in extraction
      if ('error' in extractedData) {
        continue;
      }
      
      // If there are test results, create a row for each parameter
      if (extractedData.results && extractedData.results.length > 0) {
        for (const result of extractedData.results) {
          flattenedData.push({
            fileId: file.id,
            filename: file.filename,
            patientName: extractedData.patientName,
            patientAge: extractedData.patientAge,
            patientGender: extractedData.patientGender,
            testType: extractedData.testType,
            testDate: extractedData.testDate,
            laboratory: extractedData.laboratory,
            doctorName: extractedData.doctorName,
            uploadDate: file.uploadDate.toISOString(),
            parameter: result.parameter,
            value: result.value,
            unit: result.unit,
            referenceRange: result.referenceRange,
            status: result.status,
            notes: result.notes,
            confidence: extractedData.metadata?.confidence || 0,
            processingTime: extractedData.metadata?.processingTime || 0,
            extractionDate: extractedData.metadata?.extractionDate || ''
          });
        }
      } else {
        // If no specific results, create a summary row
        flattenedData.push({
          fileId: file.id,
          filename: file.filename,
          patientName: extractedData.patientName,
          patientAge: extractedData.patientAge,
          patientGender: extractedData.patientGender,
          testType: extractedData.testType,
          testDate: extractedData.testDate,
          laboratory: extractedData.laboratory,
          doctorName: extractedData.doctorName,
          uploadDate: file.uploadDate.toISOString(),
          parameter: 'Summary',
          value: extractedData.summary,
          unit: '',
          referenceRange: '',
          status: 'unknown',
          notes: extractedData.recommendations?.join('; '),
          confidence: extractedData.metadata?.confidence || 0,
          processingTime: extractedData.metadata?.processingTime || 0,
          extractionDate: extractedData.metadata?.extractionDate || ''
        });
      }
    }
    
    if (format === 'csv') {
      // Convert to CSV format
      const headers = [
        'File ID', 'Filename', 'Patient Name', 'Patient Age', 'Patient Gender',
        'Test Type', 'Test Date', 'Laboratory', 'Doctor Name', 'Upload Date',
        'Parameter', 'Value', 'Unit', 'Reference Range', 'Status', 'Notes',
        'Confidence', 'Processing Time (ms)', 'Extraction Date'
      ];
      
      const csvRows = [headers.join(',')];
      
      for (const row of flattenedData) {
        const csvRow = [
          row.fileId,
          `"${row.filename}"`,
          `"${row.patientName || ''}"`,
          row.patientAge || '',
          row.patientGender || '',
          `"${row.testType}"`,
          row.testDate || '',
          `"${row.laboratory || ''}"`,
          `"${row.doctorName || ''}"`,
          row.uploadDate,
          `"${row.parameter}"`,
          `"${row.value}"`,
          row.unit || '',
          `"${row.referenceRange || ''}"`,
          row.status,
          `"${row.notes || ''}"`,
          row.confidence,
          row.processingTime,
          row.extractionDate
        ].join(',');
        
        csvRows.push(csvRow);
      }
      
      return new Response(csvRows.join('\n'), {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="medical-data-export.csv"'
        }
      });
    }
    
    // Return JSON format
    return json({
      totalFiles: processedFiles.length,
      totalParameters: flattenedData.length,
      exportDate: new Date().toISOString(),
      data: flattenedData
    });
    
  } catch (error) {
    console.error('Error exporting data:', error);
    return json(
      { 
        error: 'Export failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }, 
      { status: 500 }
    );
  }
};