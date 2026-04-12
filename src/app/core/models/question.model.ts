export interface LocalizedText {
  de: string;
  en: string;
}

export type Category = 'geography' | 'history' | 'famous-people' | 'science-tech' | 'flags' | 'capitals' | 'map';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type QuestionType = 'text' | 'flag' | 'map';

export type Continent = 'europe' | 'africa' | 'asia' | 'americas' | 'oceania';

export interface Question {
  id: string;
  category: Category;
  difficulty: Difficulty;
  question: LocalizedText;
  options: LocalizedText[];
  correctIndex: number;
  year?: number;
  type?: QuestionType;
  flagCode?: string;
  countryCode?: string;
  continent?: Continent;
  sourceUrl: string;
  sourceLabel: string;
}

export interface TimelineEvent {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  year: number;
  category: Category;
  sourceUrl: string;
}

export interface CategoryData {
  category: Category;
  questions: Question[];
  timelineEvents: TimelineEvent[];
}
