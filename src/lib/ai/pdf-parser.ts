import { readFile } from 'fs/promises';
import { join } from 'path';
import { UPLOAD_DIR, LLM_API_KEY, LLM_API_URL } from '$env/static/private';

export interface MedicalData {
  patientInfo?: {
    name?: string;
    age?: string;
    gender?: string;
  };
  testDate?: string;
  testType?: string;
  results?: Array<{
    parameter: string;
    value: string;
    unit?: string;
    referenceRange?: string;
    status?: 'normal' | 'high' | 'low' | 'critical';
  }>;
  summary?: string;
  recommendations?: string[];
  rawText?: string;
}

export async function extractPdfText(filePath: string): Promise<string> {
  try {
    const fullPath = join(UPLOAD_DIR, filePath);
    
    // For now, we'll use a placeholder approach that works
    // In production, you would integrate with a proper PDF parsing service
    // or use a more reliable server-side PDF parsing solution
    
    console.log(`Processing PDF: ${fullPath}`);
    
    // Simulate PDF text extraction
    // In a real implementation, you would:
    // 1. Use a reliable PDF parsing service (like AWS Textract)
    // 2. Use a Python subprocess to run a PDF parser
    // 3. Use a dedicated PDF parsing API
    
    return `PDF content from ${filePath} - This is a placeholder for actual PDF text extraction. 
    In production, this would contain the actual extracted text from the medical PDF.
    Medical test results would be parsed and structured here.`;
    
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

export async function parseMedicalTest(pdfText: string): Promise<MedicalData> {
  if (!LLM_API_KEY || !LLM_API_URL) {
    console.warn('LLM API not configured - returning basic structure');
    return {
      rawText: pdfText,
      summary: 'LLM API not configured - manual review required',
      testType: 'Unknown',
      results: []
    };
  }

  try {
    const prompt = `
    You are a medical document parser. Analyze the following medical test report and extract structured information in JSON format.

    Extract the following information:
    - patientInfo: { name, age, gender }
    - testDate: date of the test
    - testType: type of medical test (blood test, urine test, etc.)
    - results: array of test parameters with { parameter, value, unit, referenceRange, status }
    - summary: brief summary of the test results
    - recommendations: array of recommendations based on results

    For the "status" field, determine if each result is "normal", "high", "low", or "critical" based on reference ranges.

    Medical test report text:
    ${pdfText}

    Respond only with valid JSON. If you cannot extract certain information, use null for that field.
    `;

    const response = await fetch(LLM_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LLM_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo', // Adjust based on your LLM provider
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error(`LLM API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content received from LLM API');
    }

    try {
      const parsedData = JSON.parse(content) as MedicalData;
      parsedData.rawText = pdfText; // Always include raw text as backup
      return parsedData;
    } catch (parseError) {
      console.error('Error parsing LLM response as JSON:', parseError);
      // Fallback to basic structure with raw content
      return {
        rawText: pdfText,
        summary: content, // Use LLM response as summary even if not JSON
        testType: 'Unknown',
        results: []
      };
    }

  } catch (error) {
    console.error('Error calling LLM API:', error);
    // Fallback to basic structure
    return {
      rawText: pdfText,
      summary: 'Error processing with AI - manual review required',
      testType: 'Unknown',
      results: []
    };
  }
}

export async function processPdfFile(filePath: string): Promise<MedicalData> {
  const pdfText = await extractPdfText(filePath);
  const medicalData = await parseMedicalTest(pdfText);
  return medicalData;
}