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
