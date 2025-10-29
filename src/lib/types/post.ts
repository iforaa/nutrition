import type { Tag } from '$lib/constants/tags';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string | Date;
  questionnaire?: Record<string, string>;
}

export interface Review {
  id: string;
  reviewData: string | { text: string } | any;
  reviewerName: string;
  isUserComment: boolean;
  createdAt: string | Date;
  user?: User;
}

export interface MedicalTestResult {
  name: string;
  value: string;
  unit: string;
  referenceRange: string;
  status: 'normal' | 'high' | 'low' | string;
}

export interface MedicalTestData {
  testName: string;
  testDate: string;
  patientInfo?: {
    name?: string;
  };
  results: MedicalTestResult[];
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

export type ExtractedData = MedicalTestData | FoodAnalysisData;

export interface Post {
  id: string;
  title: string;
  description?: string;
  content?: string;
  photos?: string[];
  tag?: Tag | null;
  commentsAllowed?: boolean;
  createdAt: string | Date;
  reviews: Review[];
  extractedData?: ExtractedData;
  user: User;
}

export type PostType = 'image' | 'pdf' | 'text';
