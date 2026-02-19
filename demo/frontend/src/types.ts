// Types for the application
export type Difficulty = 'easy' | 'medium' | 'hard';
export type Subject = 'sorting' | 'hash' | 'graph' | 'array' | 'string';

export interface Question {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  subject: Subject;
  starterCode: string;
  testCases: TestCase[];
}

export interface TestCase {
  input: string;
  expectedOutput: string;
  description?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
