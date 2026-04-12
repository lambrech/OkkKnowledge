import { Category } from './question.model';

export interface CategoryScore {
  answered: number;
  correct: number;
}

export interface QuizScore {
  totalAnswered: number;
  totalCorrect: number;
  byCategory: Record<Category, CategoryScore>;
  streak: number;
  bestStreak: number;
  bestRoundScore: number;
  bestRoundTotal: number;
}

export interface TimelineScore {
  gamesPlayed: number;
  totalEventsPlaced: number;
  totalCorrectPlacements: number;
  exactYearBonuses: number;
  bestGameScore: number;
}

export interface UserProgress {
  quiz: QuizScore;
  timeline: TimelineScore;
  answeredQuestionIds: string[];
  lastPlayed: string;
  preferredLanguage: 'de' | 'en';
  theme: 'light' | 'dark' | 'system';
  questionsPerRound: number;
}

export function createDefaultProgress(): UserProgress {
  return {
    quiz: {
      totalAnswered: 0,
      totalCorrect: 0,
      byCategory: {
        'geography': { answered: 0, correct: 0 },
        'history': { answered: 0, correct: 0 },
        'famous-people': { answered: 0, correct: 0 },
        'science-tech': { answered: 0, correct: 0 },
        'flags': { answered: 0, correct: 0 },
        'capitals': { answered: 0, correct: 0 },
        'map': { answered: 0, correct: 0 },
      },
      streak: 0,
      bestStreak: 0,
      bestRoundScore: 0,
      bestRoundTotal: 0,
    },
    timeline: {
      gamesPlayed: 0,
      totalEventsPlaced: 0,
      totalCorrectPlacements: 0,
      exactYearBonuses: 0,
      bestGameScore: 0,
    },
    answeredQuestionIds: [],
    lastPlayed: '',
    preferredLanguage: 'de',
    theme: 'system',
    questionsPerRound: 20,
  };
}
