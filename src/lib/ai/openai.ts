import { LLM_API_KEY, UPLOAD_DIR } from '$env/static/private';
import fs from 'fs';
import path from 'path';

export interface TestResult {
  name: string;
  value: string;
  unit: string;
  referenceRange: string;
  status?: 'normal' | 'high' | 'low';
}

export interface ExtractedTestData {
  testName: string;
  testDate: string;
  patientInfo?: {
    name?: string;
    age?: string;
    gender?: string;
  };
  results: TestResult[];
  summary?: string;
}

export interface FoodAnalysisData {
  foodName?: string;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
    calories: number;
  };
  summary?: string;
}

export async function extractTestDataFromPDF(pdfPath: string): Promise<ExtractedTestData> {
  try {
    console.log('=== PDF EXTRACTION START ===');
    console.log('Received pdfPath:', pdfPath);
    console.log('pdfPath type:', typeof pdfPath);

    // Fetch PDF from Cloudflare or local path
    let pdfBuffer: Buffer;

    if (pdfPath.startsWith('http://') || pdfPath.startsWith('https://')) {
      // Fetch from Cloudflare
      console.log('Fetching PDF from URL:', pdfPath);
      const response = await fetch(pdfPath);
      if (!response.ok) {
        throw new Error(`Failed to fetch PDF from ${pdfPath}: ${response.statusText}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      pdfBuffer = Buffer.from(arrayBuffer);
      console.log('PDF fetched successfully. Size:', pdfBuffer.length, 'bytes');
    } else {
      // Legacy: read from local uploads directory
      console.log('Reading from local uploads (legacy)');
      let relativePath = pdfPath;
      if (relativePath.startsWith('/uploads/')) {
        relativePath = relativePath.substring('/uploads/'.length);
      } else if (relativePath.startsWith('uploads/')) {
        relativePath = relativePath.substring('uploads/'.length);
      }
      const fullPath = path.join(UPLOAD_DIR, relativePath);
      console.log('Full PDF path:', fullPath);

      if (!fs.existsSync(fullPath)) {
        throw new Error(`PDF file not found at: ${fullPath}`);
      }
      pdfBuffer = fs.readFileSync(fullPath);
      console.log('PDF file size:', pdfBuffer.length, 'bytes');
    }

    // Extract text from PDF using PDF.js with Node.js polyfills
    console.log('Extracting text using PDF.js...');
    let pdfText = '';

    try {
      // Setup DOM polyfills for Node.js environment
      const { Canvas } = await import('canvas');

      // @ts-ignore - Polyfill DOMMatrix for Node.js
      if (typeof globalThis.DOMMatrix === 'undefined') {
        globalThis.DOMMatrix = class DOMMatrix {
          a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
          constructor(init?: any) {
            if (Array.isArray(init)) {
              [this.a, this.b, this.c, this.d, this.e, this.f] = init;
            }
          }
        };
      }

      // Import PDF.js
      const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');

      // Load the PDF document
      console.log('Loading PDF document...');
      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(pdfBuffer),
        useSystemFonts: true,
        standardFontDataUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/standard_fonts/'
      });

      const pdf = await loadingTask.promise;
      console.log('PDF loaded successfully. Pages:', pdf.numPages);

      // Extract text from all pages
      const textParts: string[] = [];
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        console.log(`Extracting text from page ${pageNum}/${pdf.numPages}...`);
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        textParts.push(pageText);
      }

      pdfText = textParts.join('\n\n');
      console.log('Extracted text length:', pdfText.length, 'characters');
      console.log('First 1000 chars:', pdfText.substring(0, 1000));
    } catch (pdfError) {
      console.error('=== PDF.js PARSING ERROR ===');
      console.error('Error type:', typeof pdfError);
      console.error('Error:', pdfError);
      console.error('Error message:', pdfError instanceof Error ? pdfError.message : String(pdfError));
      console.error('Error stack:', pdfError instanceof Error ? pdfError.stack : 'No stack');
      throw new Error('Failed to extract text from PDF: ' + (pdfError instanceof Error ? pdfError.message : String(pdfError)));
    }

    if (!pdfText || pdfText.trim().length === 0) {
      throw new Error('PDF text extraction returned empty content');
    }

    // Send text to GPT-4o for analysis
    console.log('Sending text to OpenAI for analysis...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LLM_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `Ты медицинский аналитик результатов анализов. Извлеки структурированные данные из медицинских анализов.
Верни ТОЛЬКО валидный JSON в этой точной структуре (без markdown, без объяснений):
{
  "testName": "Название анализа/теста",
  "testDate": "Дата в формате YYYY-MM-DD",
  "patientInfo": {
    "name": "Имя пациента если доступно",
    "age": "Возраст пациента если доступен",
    "gender": "Пол пациента если доступен"
  },
  "results": [
    {
      "name": "Название показателя",
      "value": "Значение результата",
      "unit": "Единица измерения",
      "referenceRange": "Референсные значения",
      "status": "normal" | "high" | "low"
    }
  ],
  "summary": "Краткое резюме ключевых находок"
}

Все поля должны быть на русском языке. Для каждого показателя определи status: "normal" если в норме, "high" если повышен, "low" если понижен.`
          },
          {
            role: 'user',
            content: `Проанализируй этот медицинский анализ и извлеки все показатели в указанном JSON формате. Вот содержимое анализа:\n\n${pdfText.substring(0, 20000)}`
          }
        ],
        temperature: 0.3,
        max_tokens: 10000,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log('OpenAI response received');

    const content = data.choices[0].message.content;
    console.log('Content received, length:', content.length);
    console.log('Full content:', content);

    // Parse JSON response
    const extractedData: ExtractedTestData = JSON.parse(content);
    console.log('Successfully parsed JSON data');

    return extractedData;

  } catch (error) {
    console.error('Error extracting test data:', error);
    throw error;
  }
}

export async function analyzeFoodFromImage(imagePath: string): Promise<FoodAnalysisData> {
  try {
    console.log('=== FOOD ANALYSIS START ===');
    console.log('Received imagePath:', imagePath);
    console.log('imagePath type:', typeof imagePath);
    console.log('UPLOAD_DIR:', UPLOAD_DIR);

    let base64Image: string;

    // Check if it's a URL (external image) or local file path
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      console.log('External image URL detected, fetching...');

      // Fetch the image from URL
      const imageResponse = await fetch(imagePath);
      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch image from URL: ${imagePath}`);
      }

      const imageArrayBuffer = await imageResponse.arrayBuffer();
      const imageBuffer = Buffer.from(imageArrayBuffer);
      console.log('Image fetched, size:', imageBuffer.length, 'bytes');
      base64Image = imageBuffer.toString('base64');
    } else {
      // Local file path
      console.log('Local file path detected');

      // The imagePath from database is like: /uploads/af8ebfcd-.../food.jpg
      // We need to remove the /uploads prefix and use UPLOAD_DIR instead
      let relativePath = imagePath;
      if (relativePath.startsWith('/uploads/')) {
        relativePath = relativePath.substring('/uploads/'.length);
      } else if (relativePath.startsWith('uploads/')) {
        relativePath = relativePath.substring('uploads/'.length);
      }
      console.log('Relative path:', relativePath);

      // Join with UPLOAD_DIR (which is ./uploads)
      const fullPath = path.join(UPLOAD_DIR, relativePath);
      console.log('Full image path:', fullPath);
      console.log('Path exists?', fs.existsSync(fullPath));

      // Check if file exists
      if (!fs.existsSync(fullPath)) {
        // List directory contents for debugging
        const dirPath = path.dirname(fullPath);
        console.log('Directory path:', dirPath);
        if (fs.existsSync(dirPath)) {
          console.log('Directory contents:', fs.readdirSync(dirPath));
        } else {
          console.log('Directory does not exist');
        }
        throw new Error(`Image file not found at: ${fullPath}`);
      }

      // Read the image file and convert to base64
      console.log('Reading image file...');
      const imageBuffer = fs.readFileSync(fullPath);
      console.log('Image file size:', imageBuffer.length, 'bytes');
      base64Image = imageBuffer.toString('base64');
    }

    // Send image to GPT-4o Vision for analysis
    console.log('Sending image to OpenAI for food analysis...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LLM_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `Ты эксперт по питанию и диетологии. Проанализируй фотографию еды и определи пищевую ценность.
Верни ТОЛЬКО валидный JSON в этой точной структуре (без markdown, без объяснений):
{
  "foodName": "Название блюда",
  "macros": {
    "protein": число (граммы белка),
    "carbs": число (граммы углеводов),
    "fats": число (граммы жиров),
    "calories": число (калории)
  },
  "summary": "Краткое описание блюда и его состава"
}

Все текстовые поля должны быть на русском языке. Постарайся максимально точно оценить порцию и макронутриенты.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Проанализируй эту еду и определи пищевую ценность в указанном JSON формате.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log('OpenAI response received');

    const content = data.choices[0].message.content;
    console.log('Content received, length:', content.length);
    console.log('Full content:', content);

    // Parse JSON response
    const foodData: FoodAnalysisData = JSON.parse(content);
    console.log('Successfully parsed JSON data');

    return foodData;

  } catch (error) {
    console.error('Error analyzing food:', error);
    throw error;
  }
}
