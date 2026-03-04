export type TestMode = 'FULL_MOCK' | 'PART_1' | 'PART_2' | 'PART_3' | 'DAILY_CONVO';

export type ReadingMode = 'FULL_TEST' | 'PRACTICE' | 'TIMED' | 'UNTIMED';

export type WritingMode = 'TASK_1' | 'TASK_2' | 'FULL_TEST';

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

export interface WritingTask {
  id: string;
  type: 'TASK_1' | 'TASK_2';
  prompt: string;
  imageUrl?: string; // For Task 1 graphs/charts
  wordLimit: number;
  timeLimit: number;
}

export interface WritingResult {
  id: string;
  date: string;
  taskType: 'TASK_1' | 'TASK_2';
  userText: string;
  wordCount: number;
  timeUsed: number;
  bandScore: number;
  criteriaScores: {
    taskResponse: number;
    coherence: number;
    lexical: number;
    grammar: number;
  };
  feedback: {
    banglaSummary: string;
    strengths: string[];
    weaknesses: string[];
    grammarCorrections: { original: string; corrected: string; explanation: string }[];
    vocabularySuggestions: { word: string; betterAlternative: string; context: string }[];
    improvementPlan: string[];
  };
}

export interface TestSession {
  id: string;
  date: string;
  mode: TestMode | ReadingMode | WritingMode;
  candidateName: string;
  topic?: string;
  bandScore?: number;
  feedback?: FeedbackData | ReadingTestResult | WritingResult;
  duration: number;
  stressLevel?: 'Low' | 'Moderate' | 'High';
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
}
