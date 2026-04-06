import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoDirective } from '@jsverse/transloco';
import { ScoreService } from '../../core/services/score.service';
import { Category } from '../../core/models/question.model';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [MatCardModule, MatProgressBarModule, MatIconModule, TranslocoDirective],
  template: `
    <ng-container *transloco="let t">
      <h1>{{ t('stats.title') }}</h1>

      @if (score.quizScore().totalAnswered === 0 && score.timelineScore().gamesPlayed === 0) {
        <p class="no-data">{{ t('stats.noData') }}</p>
      } @else {
        @if (score.quizScore().bestRoundTotal > 0) {
          <mat-card class="best-game-card" appearance="outlined">
            <mat-card-content>
              <div class="best-game">
                <mat-icon class="trophy-icon">emoji_events</mat-icon>
                <div class="best-game-info">
                  <span class="best-game-label">{{ t('stats.bestGame') }}</span>
                  <span class="best-game-score">{{ score.quizScore().bestRoundScore }}/{{ score.quizScore().bestRoundTotal }}</span>
                  <span class="best-game-pct">{{ getBestRoundPct() }}%</span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        }

        @if (score.quizScore().totalAnswered > 0) {
          <mat-card class="stats-card" appearance="outlined">
            <mat-card-header>
              <mat-card-title>{{ t('stats.quizStats') }}</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="stat-row">
                <span>{{ t('stats.totalAnswered') }}</span>
                <strong>{{ score.quizScore().totalAnswered }}</strong>
              </div>
              <div class="stat-row">
                <span>{{ t('stats.totalCorrect') }}</span>
                <strong>{{ score.quizScore().totalCorrect }}</strong>
              </div>
              <div class="stat-row">
                <span>{{ t('stats.accuracy') }}</span>
                <strong>{{ score.quizAccuracy() }}%</strong>
              </div>
              <mat-progress-bar mode="determinate" [value]="score.quizAccuracy()"></mat-progress-bar>
              <div class="stat-row">
                <span>{{ t('stats.bestStreak') }}</span>
                <strong>{{ score.quizScore().bestStreak }}</strong>
              </div>
              @if (score.quizScore().bestRoundTotal > 0) {
                <div class="stat-row">
                  <span>{{ t('stats.bestRound') }}</span>
                  <strong>{{ score.quizScore().bestRoundScore }}/{{ score.quizScore().bestRoundTotal }}</strong>
                </div>
              }
              <div class="stat-row">
                <span>{{ t('stats.currentStreak') }}</span>
                <strong>{{ score.quizScore().streak }}</strong>
              </div>

              <h3>{{ t('stats.byCategory') }}</h3>
              @for (cat of categories; track cat) {
                <div class="category-stat">
                  <span>{{ t('categories.' + cat) }}</span>
                  <span>{{ getCatCorrect(cat) }}/{{ getCatAnswered(cat) }}</span>
                </div>
                <mat-progress-bar mode="determinate" [value]="getCatAccuracy(cat)"></mat-progress-bar>
              }
            </mat-card-content>
          </mat-card>
        }

        @if (score.timelineScore().gamesPlayed > 0) {
          <mat-card class="stats-card" appearance="outlined">
            <mat-card-header>
              <mat-card-title>{{ t('stats.timelineStats') }}</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="stat-row">
                <span>{{ t('stats.gamesPlayed') }}</span>
                <strong>{{ score.timelineScore().gamesPlayed }}</strong>
              </div>
              <div class="stat-row">
                <span>{{ t('stats.eventsPlaced') }}</span>
                <strong>{{ score.timelineScore().totalEventsPlaced }}</strong>
              </div>
              <div class="stat-row">
                <span>{{ t('stats.placementAccuracy') }}</span>
                <strong>{{ getTimelineAccuracy() }}%</strong>
              </div>
              <mat-progress-bar mode="determinate" [value]="getTimelineAccuracy()"></mat-progress-bar>
              <div class="stat-row">
                <span>{{ t('stats.exactYearBonuses') }}</span>
                <strong>{{ score.timelineScore().exactYearBonuses }}</strong>
              </div>
              <div class="stat-row">
                <span>{{ t('stats.bestGameScore') }}</span>
                <strong>{{ score.timelineScore().bestGameScore }}</strong>
              </div>
            </mat-card-content>
          </mat-card>
        }
      }
    </ng-container>
  `,
  styles: [`
    .stats-card {
      margin-bottom: 16px;

      mat-card-content {
        padding-top: 16px;
      }

      h3 {
        margin-top: 20px;
        margin-bottom: 12px;
      }
    }

    .best-game-card {
      margin-bottom: 16px;
      background: linear-gradient(135deg, #fff8e1, #fff3e0) !important;
    }

    .best-game {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 8px 0;
    }

    .trophy-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #f9a825;
    }

    .best-game-info {
      display: flex;
      flex-direction: column;
    }

    .best-game-label {
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: rgba(0,0,0,0.5);
      font-weight: 500;
    }

    .best-game-score {
      font-size: 2rem;
      font-weight: 700;
      color: #3f51b5;
      line-height: 1.2;
    }

    .best-game-pct {
      font-size: 0.9rem;
      color: rgba(0,0,0,0.5);
    }

    .stat-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid rgba(0,0,0,0.06);
    }

    .category-stat {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
      font-size: 0.9rem;
    }

    mat-progress-bar {
      margin-bottom: 12px;
    }

    .no-data {
      text-align: center;
      color: rgba(0,0,0,0.5);
      padding: 48px 16px;
      font-size: 1.1rem;
    }

    :host-context(body.dark-theme) {
      .stat-row { border-bottom-color: rgba(255,255,255,0.06); }
      .no-data { color: rgba(255,255,255,0.5); }
      .best-game-card { background: linear-gradient(135deg, #3e2723, #4e342e) !important; }
      .best-game-label, .best-game-pct { color: rgba(255,255,255,0.5); }
      .best-game-score { color: #90caf9; }
      .trophy-icon { color: #ffb300; }
    }
  `]
})
export class StatsComponent {
  score = inject(ScoreService);
  categories = ['geography', 'history', 'famous-people', 'science-tech', 'flags', 'capitals'] as const;

  getCatAnswered(cat: string): number {
    const byCategory = this.score.quizScore().byCategory;
    return (byCategory[cat as Category])?.answered ?? 0;
  }

  getCatCorrect(cat: string): number {
    const byCategory = this.score.quizScore().byCategory;
    return (byCategory[cat as Category])?.correct ?? 0;
  }

  getCatAccuracy(cat: string): number {
    const a = this.getCatAnswered(cat);
    return a > 0 ? Math.round((this.getCatCorrect(cat) / a) * 100) : 0;
  }

  getTimelineAccuracy(): number {
    const t = this.score.timelineScore();
    return t.totalEventsPlaced > 0 ? Math.round((t.totalCorrectPlacements / t.totalEventsPlaced) * 100) : 0;
  }

  getBestRoundPct(): number {
    const q = this.score.quizScore();
    return q.bestRoundTotal > 0 ? Math.round((q.bestRoundScore / q.bestRoundTotal) * 100) : 0;
  }
}
