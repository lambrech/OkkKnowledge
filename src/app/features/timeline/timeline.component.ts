import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TranslocoDirective } from '@jsverse/transloco';
import { LocalizedTextPipe } from '../../shared/pipes/localized-text.pipe';
import { QuestionService } from '../../core/services/question.service';
import { ScoreService } from '../../core/services/score.service';
import { TimelineEvent } from '../../core/models/question.model';

type TimelineState = 'start' | 'playing' | 'yearGuess' | 'result';

interface PlacedEvent extends TimelineEvent {
  revealed: boolean;
}

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    MatCardModule, MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule,
    TranslocoDirective, LocalizedTextPipe,
  ],
  templateUrl: './timeline.component.html',
  styleUrl: './timeline.component.scss',
})
export class TimelineComponent {
  private questionService = inject(QuestionService);
  private scoreService = inject(ScoreService);

  state = signal<TimelineState>('start');
  deck = signal<TimelineEvent[]>([]);
  placedEvents = signal<PlacedEvent[]>([]);
  currentEvent = signal<TimelineEvent | null>(null);
  score = signal(0);
  lives = signal(3);
  eventsPlaced = signal(0);
  correctPlacements = signal(0);
  yearGuess = '';
  lastPlacementCorrect = signal(false);
  feedbackMessage = signal('');
  showFeedback = signal(false);

  sortedPlaced = computed(() =>
    [...this.placedEvents()].sort((a, b) => a.year - b.year)
  );

  startGame(): void {
    const events = this.questionService.getTimelineEvents(15);
    if (events.length < 2) return;

    const first = events[0];
    const rest = events.slice(1);

    this.placedEvents.set([{ ...first, revealed: true }]);
    this.deck.set(rest);
    this.score.set(0);
    this.lives.set(3);
    this.eventsPlaced.set(0);
    this.correctPlacements.set(0);
    this.drawNext();
    this.state.set('playing');
  }

  private drawNext(): void {
    const d = this.deck();
    if (d.length === 0) {
      this.endGame();
      return;
    }
    this.currentEvent.set(d[0]);
    this.deck.set(d.slice(1));
    this.showFeedback.set(false);
    this.feedbackMessage.set('');
  }

  placeAt(index: number): void {
    if (this.showFeedback()) return;

    const event = this.currentEvent();
    if (!event) return;

    const sorted = this.sortedPlaced();
    let correctIndex = 0;
    for (let i = 0; i <= sorted.length; i++) {
      const before = i > 0 ? sorted[i - 1].year : -Infinity;
      const after = i < sorted.length ? sorted[i].year : Infinity;
      if (event.year >= before && event.year <= after) {
        correctIndex = i;
        break;
      }
    }

    const isCorrect = index === correctIndex;
    this.eventsPlaced.update(n => n + 1);
    this.lastPlacementCorrect.set(isCorrect);
    this.showFeedback.set(true);

    if (isCorrect) {
      this.score.update(s => s + 10);
      this.correctPlacements.update(n => n + 1);
      this.scoreService.recordTimelinePlacement(true, false);
    } else {
      this.lives.update(l => l - 1);
      this.scoreService.recordTimelinePlacement(false, false);
    }

    // Always place the event in the correct position
    this.placedEvents.update(events => [...events, { ...event, revealed: true }]);
    this.currentEvent.set(null);

    // Short delay then move to year guess (if correct) or next
    setTimeout(() => {
      if (isCorrect) {
        this.yearGuess = '';
        this.state.set('yearGuess');
      } else if (this.lives() <= 0) {
        this.endGame();
      } else {
        this.drawNext();
      }
    }, 1200);
  }

  checkYearGuess(): void {
    const allPlaced = this.placedEvents();
    const lastPlaced = allPlaced[allPlaced.length - 1];

    const guess = parseInt(this.yearGuess, 10);
    if (!isNaN(guess) && guess === lastPlaced.year) {
      this.score.update(s => s + 5);
      this.scoreService.recordTimelinePlacement(true, true);
      this.feedbackMessage.set('bonus');
    }

    this.state.set('playing');
    if (this.lives() <= 0) {
      this.endGame();
    } else {
      this.drawNext();
    }
  }

  skipYearGuess(): void {
    this.state.set('playing');
    if (this.lives() <= 0) {
      this.endGame();
    } else {
      this.drawNext();
    }
  }

  private endGame(): void {
    this.scoreService.endTimelineGame(this.score());
    this.state.set('result');
  }
}
