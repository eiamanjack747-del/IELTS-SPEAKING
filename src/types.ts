export type TestMode = 'FULL_MOCK' | 'PART_1' | 'PART_2' | 'PART_3' | 'DAILY_CONVO' | 'VISA_INTERVIEW';

export type ReadingMode = 'FULL_TEST' | 'PRACTICE' | 'TIMED' | 'UNTIMED';

export type ReadingQuestionType = 
  | 'multiple_choice'
  | 'true_false_not_given'
  | 'yes_no_not_given'
  | 'matching_headings'
  | 'matching_information'
  | 'matching_features'
  | 'matching_sentence_endings'
  | 'sentence_completion'
  | 'summary_completion'
  | 'note_completion'
  | 'table_completion'
  | 'flow_chart_completion'
  | 'diagram_label_completion'
  | 'short_answer_questions';

export interface ReadingQuestion {
  id: string;
  text: string;
  type: ReadingQuestionType;
  options?: string[]; // For MCQ or Matching
  correctAnswer: string;
  explanation?: string; // For instant feedback
}

export interface ReadingPassage {
  id: string;
  title: string;
  content: string;
  difficulty: 'easy' | 'moderate' | 'hard';
  topic: string;
  questions: ReadingQuestion[];
}

export interface ReadingTestResult {
  id: string;
  date: string;
  mode: ReadingMode;
  rawScore: number;
  bandScore: number;
  timeUsed: number;
  answers: Record<string, string>; // questionId -> userAnswer
  feedback: {
    strengths: string[];
    weaknesses: string[];
    detailedAnalysis: {
      questionId: string;
      isCorrect: boolean;
      userAnswer: string;
      correctAnswer: string;
      explanation: string; // Bangla explanation
      mistakeType?: string;
    }[];
    timeManagementAdvice: string;
    improvementPlan: string[];
  };
}

export interface TestSession {
  id: string;
  date: string;
  mode: TestMode | ReadingMode; // Allow both speaking and reading modes
  candidateName: string;
  topic?: string;
  bandScore?: number;
  feedback?: FeedbackData | ReadingTestResult; // Allow both feedback types
  duration: number;
  stressLevel?: 'Low' | 'Moderate' | 'High'; // Optional for reading
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
