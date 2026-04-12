import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { LocalizedTextPipe } from '../../shared/pipes/localized-text.pipe';
import { MapDisplayComponent } from '../../shared/components/map-display.component';
import { QuestionService } from '../../core/services/question.service';
import { ScoreService } from '../../core/services/score.service';
import { Question, Category, Continent } from '../../core/models/question.model';

type QuizState = 'setup' | 'playing' | 'result';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [
    RouterLink,
    MatCardModule, MatButtonModule, MatIconModule, MatChipsModule, MatProgressBarModule,
    MatSnackBarModule,
    TranslocoDirective, LocalizedTextPipe, MapDisplayComponent,
  ],
  templateUrl: './quiz.component.html',
  styleUrl: './quiz.component.scss',
})
export class QuizComponent {
  private questionService = inject(QuestionService);
  protected scoreService = inject(ScoreService);
  private snackBar = inject(MatSnackBar);
  transloco = inject(TranslocoService);

  state = signal<QuizState>('setup');
  selectedCategories = signal<Category[]>(['geography', 'history', 'famous-people', 'science-tech', 'flags', 'capitals', 'map']);
  questionsPerRound = signal(20);
  questions = signal<Question[]>([]);
  currentIndex = signal(0);
  sessionScore = signal(0);
  selectedAnswer = signal<number | null>(null);
  showFeedback = signal(false);

  currentQuestion = computed(() => this.questions()[this.currentIndex()]);
  progress = computed(() => {
    const total = this.questions().length;
    return total > 0 ? ((this.currentIndex()) / total) * 100 : 0;
  });
  isCorrect = computed(() => {
    const sel = this.selectedAnswer();
    const q = this.currentQuestion();
    return sel !== null && q ? sel === q.correctIndex : false;
  });

  // Geography sub-categories
  readonly geographySubCategories: Category[] = ['geography', 'flags', 'capitals', 'map'];
  readonly nonGeographyCategories: Category[] = ['history', 'famous-people', 'science-tech'];

  geographyGroupState = computed(() => {
    const cats = this.selectedCategories();
    const allSelected = this.geographySubCategories.every(c => cats.includes(c));
    const noneSelected = this.geographySubCategories.every(c => !cats.includes(c));
    if (allSelected) return 'all';
    if (noneSelected) return 'none';
    return 'partial';
  });

  isGeographyExpanded = signal(false);

  allContinents: Continent[] = ['europe', 'africa', 'asia', 'americas', 'oceania'];
  selectedContinents = signal<Continent[]>(['europe', 'africa', 'asia', 'americas', 'oceania']);
  showContinentFilter = computed(() => {
    const cats = this.selectedCategories();
    return cats.includes('flags') || cats.includes('capitals') || cats.includes('map');
  });

  constructor() {
    this.questionsPerRound.set(this.scoreService.questionsPerRound());
  }

  toggleGeographyGroup(): void {
    const state = this.geographyGroupState();
    if (state === 'all') {
      // Deselect all geo sub-categories (only if other categories remain)
      const remaining = this.selectedCategories().filter(c => !this.geographySubCategories.includes(c));
      if (remaining.length > 0) {
        this.selectedCategories.set(remaining);
      }
    } else {
      // Select all geo sub-categories
      const withoutGeo = this.selectedCategories().filter(c => !this.geographySubCategories.includes(c));
      this.selectedCategories.set([...withoutGeo, ...this.geographySubCategories]);
    }
  }

  toggleCategory(cat: Category): void {
    this.selectedCategories.update(cats => {
      if (cats.includes(cat)) {
        return cats.length > 1 ? cats.filter(c => c !== cat) : cats;
      }
      return [...cats, cat];
    });
  }

  isCategorySelected(cat: Category): boolean {
    return this.selectedCategories().includes(cat);
  }

  toggleContinent(cont: Continent): void {
    this.selectedContinents.update(conts => {
      if (conts.includes(cont)) {
        return conts.length > 1 ? conts.filter(c => c !== cont) : conts;
      }
      return [...conts, cont];
    });
  }

  startQuiz(): void {
    const continents = this.showContinentFilter() ? this.selectedContinents() : undefined;
    let qs = this.questionService.getRandomQuestions(
      this.questionsPerRound(),
      this.selectedCategories(),
      this.scoreService.answeredIds(),
      continents
    );

    if (qs.length === 0) {
      // All questions answered — reset for selected filter and retry
      const idsToReset = this.questionService.getQuestionIdsByFilter(
        this.selectedCategories(),
        continents
      );
      this.scoreService.resetAnsweredForIds(idsToReset);
      qs = this.questionService.getRandomQuestions(
        this.questionsPerRound(),
        this.selectedCategories(),
        this.scoreService.answeredIds(),
        continents
      );
      if (qs.length > 0) {
        this.snackBar.open(
          this.transloco.translate('quiz.allAnsweredReset'),
          '', { duration: 3000 }
        );
      }
    }

    if (qs.length === 0) {
      this.snackBar.open(
        this.transloco.translate('quiz.noQuestions'),
        '', { duration: 3000 }
      );
      return;
    }

    this.questions.set(qs);
    this.currentIndex.set(0);
    this.sessionScore.set(0);
    this.selectedAnswer.set(null);
    this.showFeedback.set(false);
    this.state.set('playing');
  }

  selectAnswer(index: number): void {
    if (this.showFeedback()) return;
    this.selectedAnswer.set(index);
    this.showFeedback.set(true);

    const q = this.currentQuestion();
    const correct = index === q.correctIndex;
    if (correct) this.sessionScore.update(s => s + 1);
    this.scoreService.recordQuizAnswer(q.id, q.category, correct);
  }

  nextQuestion(): void {
    if (this.currentIndex() < this.questions().length - 1) {
      this.currentIndex.update(i => i + 1);
      this.selectedAnswer.set(null);
      this.showFeedback.set(false);
    } else {
      this.scoreService.endQuizRound(this.sessionScore(), this.questions().length);
      this.state.set('result');
    }
  }

  resetToSetup(): void {
    this.state.set('setup');
  }
}
