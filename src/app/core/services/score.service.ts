import { Injectable, inject, signal, computed } from '@angular/core';
import { StorageService } from './storage.service';
import { Category } from '../models/question.model';
import { UserProgress, createDefaultProgress } from '../models/user-progress.model';

@Injectable({ providedIn: 'root' })
export class ScoreService {
  private storage = inject(StorageService);

  private progress = signal<UserProgress>(
    this.storage.get<UserProgress>('progress', createDefaultProgress())
  );

  readonly userProgress = this.progress.asReadonly();
  readonly quizScore = computed(() => this.progress().quiz);
  readonly timelineScore = computed(() => this.progress().timeline);
  readonly quizAccuracy = computed(() => {
    const q = this.progress().quiz;
    return q.totalAnswered > 0 ? Math.round((q.totalCorrect / q.totalAnswered) * 100) : 0;
  });
  readonly answeredIds = computed(() => this.progress().answeredQuestionIds);

  recordQuizAnswer(questionId: string, category: Category, correct: boolean): void {
    this.progress.update(p => {
      const quiz = { ...p.quiz };
      quiz.totalAnswered++;
      if (correct) {
        quiz.totalCorrect++;
        quiz.streak++;
        quiz.bestStreak = Math.max(quiz.bestStreak, quiz.streak);
      } else {
        quiz.streak = 0;
      }
      const catScore = { ...quiz.byCategory[category] };
      catScore.answered++;
      if (correct) catScore.correct++;
      quiz.byCategory = { ...quiz.byCategory, [category]: catScore };

      return {
        ...p,
        quiz,
        answeredQuestionIds: [...p.answeredQuestionIds, questionId],
        lastPlayed: new Date().toISOString(),
      };
    });
    this.persist();
  }

  recordTimelinePlacement(correct: boolean, exactYear: boolean): void {
    this.progress.update(p => {
      const timeline = { ...p.timeline };
      timeline.totalEventsPlaced++;
      if (correct) timeline.totalCorrectPlacements++;
      if (exactYear) timeline.exactYearBonuses++;
      return { ...p, timeline, lastPlayed: new Date().toISOString() };
    });
    this.persist();
  }

  endTimelineGame(score: number): void {
    this.progress.update(p => {
      const timeline = { ...p.timeline };
      timeline.gamesPlayed++;
      timeline.bestGameScore = Math.max(timeline.bestGameScore, score);
      return { ...p, timeline };
    });
    this.persist();
  }

  resetQuiz(): void {
    this.progress.update(p => ({
      ...p,
      quiz: createDefaultProgress().quiz,
      answeredQuestionIds: [],
    }));
    this.persist();
  }

  resetTimeline(): void {
    this.progress.update(p => ({
      ...p,
      timeline: createDefaultProgress().timeline,
    }));
    this.persist();
  }

  resetAll(): void {
    const lang = this.progress().preferredLanguage;
    const theme = this.progress().theme;
    this.progress.set({ ...createDefaultProgress(), preferredLanguage: lang, theme });
    this.persist();
  }

  setLanguage(lang: 'de' | 'en'): void {
    this.progress.update(p => ({ ...p, preferredLanguage: lang }));
    this.persist();
  }

  setTheme(theme: 'light' | 'dark' | 'system'): void {
    this.progress.update(p => ({ ...p, theme }));
    this.persist();
  }

  private persist(): void {
    this.storage.set('progress', this.progress());
  }
}
