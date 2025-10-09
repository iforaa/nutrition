import fs from 'fs/promises';
import pdfParse from 'pdf-parse';
import OpenAI from 'openai';
import { LLM_API_KEY } from '$env/static/private';

const openai = new OpenAI({
  apiKey: LLM_API_KEY,
});

export interface MedicalTestResult {
  parameter: string;
  value: string | number;
  unit?: string;
  referenceRange?: string;
  status: 'normal' | 'high' | 'low' | 'critical' | 'unknown';
  notes?: string;
}

export interface ExtractedMedicalData {
  testType: string;
  testDate?: string;
  patientName?: string;
  patientAge?: number;
  patientGender?: string;
  laboratory?: string;
  doctorName?: string;
  summary: string;
  results: MedicalTestResult[];
  recommendations?: string[];
  criticalValues?: MedicalTestResult[];
  metadata: {
    extractionDate: string;
    confidence: number;
    processingTime: number;
  };
}

export async function extractTextFromPdf(filePath: string): Promise<string> {
  try {
    const pdfBuffer = await fs.readFile(filePath);
    const pdfData = await pdfParse(pdfBuffer);
    return pdfData.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

export async function extractMedicalDataWithAI(pdfText: string): Promise<ExtractedMedicalData> {
  const startTime = Date.now();
  
  const prompt = `
You are a medical data extraction AI. Extract structured information from the following medical test report or document. 

The text might be in Russian or English. Please extract ALL available information and return it as a JSON object with this exact structure:

{
  "testType": "Type of medical test (e.g., 'Blood Chemistry Panel', 'Complete Blood Count', 'Lipid Profile')",
  "testDate": "Date when test was performed (ISO format if possible, or original format)",
  "patientName": "Patient name if available",
  "patientAge": "Patient age as number if available",
  "patientGender": "male/female/unknown",
  "laboratory": "Name of laboratory or medical facility",
  "doctorName": "Requesting doctor name if available",
  "summary": "Brief summary of overall test results and key findings",
  "results": [
    {
      "parameter": "Test parameter name (e.g., 'Glucose', 'Cholesterol', 'Hemoglobin')",
      "value": "Measured value (number or string)",
      "unit": "Unit of measurement (e.g., 'mg/dl', 'g/L', 'mmol/L')",
      "referenceRange": "Normal reference range if provided",
      "status": "normal/high/low/critical/unknown",
      "notes": "Any additional notes or flags"
    }
  ],
  "recommendations": ["List of any medical recommendations or notes"],
  "criticalValues": ["Array of any critical or abnormal results that need attention"],
  "metadata": {
    "extractionDate": "${new Date().toISOString()}",
    "confidence": 0.85,
    "processingTime": 0
  }
}

IMPORTANT RULES:
1. Extract ALL numerical values and their parameters
2. Determine if values are normal/high/low based on reference ranges
3. If reference ranges are provided, use them to determine status
4. Include ANY recommendations or notes from the document
5. Be thorough - don't miss any test parameters
6. If information is not available, use null or "unknown"
7. For Russian text, translate parameter names to English but keep original values
8. Return ONLY the JSON object, no additional text

Medical document text:
${pdfText}
`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a medical data extraction specialist. Extract structured data from medical documents and return only valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 4000,
    });

    const extractedContent = response.choices[0]?.message?.content?.trim();
    if (!extractedContent) {
      throw new Error('No response from AI');
    }

    // Clean up the response to ensure it's valid JSON
    let jsonContent = extractedContent;
    if (jsonContent.startsWith('```json')) {
      jsonContent = jsonContent.replace(/```json\n?/, '').replace(/\n?```$/, '');
    }
    if (jsonContent.startsWith('```')) {
      jsonContent = jsonContent.replace(/```\n?/, '').replace(/\n?```$/, '');
    }

    const extractedData: ExtractedMedicalData = JSON.parse(jsonContent);
    
    // Update processing time
    extractedData.metadata.processingTime = Date.now() - startTime;
    
    return extractedData;

  } catch (error) {
    console.error('Error extracting medical data with AI:', error);
    
    // Return a fallback structure if AI extraction fails
    return {
      testType: 'Unknown Medical Document',
      summary: 'Failed to extract structured data. Manual review required.',
      results: [],
      metadata: {
        extractionDate: new Date().toISOString(),
        confidence: 0,
        processingTime: Date.now() - startTime
      }
    };
  }
}

export async function processPdfFile(filePath: string): Promise<ExtractedMedicalData> {
  try {
    console.log(`Processing PDF: ${filePath}`);
    
    // Extract text from PDF
    const pdfText = await extractTextFromPdf(filePath);
    console.log(`Extracted ${pdfText.length} characters from PDF`);
    
    if (!pdfText || pdfText.trim().length === 0) {
      throw new Error('No text content found in PDF');
    }

    // Extract structured data using AI
    const medicalData = await extractMedicalDataWithAI(pdfText);
    console.log(`Successfully extracted medical data: ${medicalData.testType}`);
    
    return medicalData;
    
  } catch (error) {
    console.error('Error processing PDF file:', error);
    throw error;
  }
}