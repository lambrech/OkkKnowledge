import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { LocalizedTextPipe } from '../../shared/pipes/localized-text.pipe';
import { MapDisplayComponent } from '../../shared/components/map-display.component';
import { QuestionService } from '../../core/services/question.service';
import { ScoreService } from '../../core/services/score.service';
import { Question, Category } from '../../core/models/question.model';

type QuizState = 'setup' | 'playing' | 'result';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [
    RouterLink,
    MatCardModule, MatButtonModule, MatIconModule, MatChipsModule, MatProgressBarModule,
    TranslocoDirective, LocalizedTextPipe, MapDisplayComponent,
  ],
  templateUrl: './quiz.component.html',
  styleUrl: './quiz.component.scss',
})
export class QuizComponent {
  private questionService = inject(QuestionService);
  protected scoreService = inject(ScoreService);
  transloco = inject(TranslocoService);

  state = signal<QuizState>('setup');
  selectedCategories = signal<Category[]>(['geography', 'history', 'famous-people', 'science-tech']);
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

  allCategories: Category[] = ['geography', 'history', 'famous-people', 'science-tech'];

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

  startQuiz(): void {
    const qs = this.questionService.getRandomQuestions(
      this.questionsPerRound(),
      this.selectedCategories(),
      this.scoreService.answeredIds()
    );
    if (qs.length === 0) return;
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
