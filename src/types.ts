export type TestMode = 'FULL_MOCK' | 'PART_1' | 'PART_2' | 'PART_3' | 'DAILY_CONVO' | 'VISA_INTERVIEW';

export interface TestSession {
  id: string;
  date: string;
  mode: TestMode;
  candidateName: string;
  topic?: string;
  bandScore?: number;
  feedback?: FeedbackData;
  duration: number;
  stressLevel: 'Low' | 'Moderate' | 'High';
}

export interface FeedbackData {
  bandScore: number;
  criteria: {
    fluency: number;
    lexical: number;
    grammar: number;
    pronunciation: number;
  };
  banglaFeedback: {
    strengths: string[];
    mistakes: { wrong: string; correct: string; explanation: string }[];
    vocabulary: string[];
    weakAreas: string[];
    improvementPlan: string[];
  };
  stressAnalysis: {
    level: 'Low' | 'Moderate' | 'High';
    advice: string;
    metrics: {
      fillers: number;
      pauses: number;
      speed: number;
    };
  };
  visaInterview?: {
    confidenceScore: number;
    clarityScore: number;
    riskLevel: 'Low' | 'Moderate' | 'High';
    embassyImpression: string;
  };
}

// Reading Test Types
export interface ReadingQuestion {
  id: string;
  text: string;
  type: 'text' | 'mcq' | 'boolean' | 'heading'; // text=fill in blank, boolean=T/F/NG
  options?: string[]; // For MCQ
  correctAnswer: string;
}

export interface ReadingPassage {
  id: string;
  title: string;
  content: string; // The full text of the passage
  questions: ReadingQuestion[];
}

export interface ReadingTest {
  id: string;
  title: string; // e.g., "Test 1"
  passages: ReadingPassage[]; // Should be 3 passages
}

export interface ReadingBook {
  id: string;
  title: string;
  author?: string;
  coverUrl?: string;
  pdfUrl?: string; // Optional now, as we might have structured content
  dateAdded: string;
  tests: ReadingTest[]; // Should be 4 tests
}
