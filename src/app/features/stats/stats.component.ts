import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TranslocoDirective } from '@jsverse/transloco';
import { ScoreService } from '../../core/services/score.service';
import { Category } from '../../core/models/question.model';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [MatCardModule, MatProgressBarModule, TranslocoDirective],
  template: `
    <ng-container *transloco="let t">
      <h1>{{ t('stats.title') }}</h1>

      @if (score.quizScore().totalAnswered === 0 && score.timelineScore().gamesPlayed === 0) {
        <p class="no-data">{{ t('stats.noData') }}</p>
      } @else {
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
    }
  `]
})
export class StatsComponent {
  score = inject(ScoreService);
  categories = ['geography', 'history', 'famous-people', 'science-tech'] as const;

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
}
