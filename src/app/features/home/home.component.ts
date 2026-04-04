import { Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoDirective } from '@jsverse/transloco';
import { ScoreService } from '../../core/services/score.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule, TranslocoDirective],
  template: `
    <ng-container *transloco="let t">
      <div class="home-container">
        <h1 class="welcome-title">{{ t('home.welcome') }}</h1>
        <p class="welcome-desc">{{ t('home.description') }}</p>

        <div class="game-cards">
          <mat-card class="game-card" appearance="outlined">
            <mat-card-header>
              <mat-icon mat-card-avatar class="card-icon quiz-icon">quiz</mat-icon>
              <mat-card-title>{{ t('nav.quiz') }}</mat-card-title>
              <mat-card-subtitle>{{ t('home.quizDescription') }}</mat-card-subtitle>
            </mat-card-header>
            <mat-card-actions>
              <a mat-flat-button routerLink="/quiz" color="primary">
                <mat-icon>play_arrow</mat-icon>
                {{ t('home.startQuiz') }}
              </a>
            </mat-card-actions>
          </mat-card>

          <mat-card class="game-card" appearance="outlined">
            <mat-card-header>
              <mat-icon mat-card-avatar class="card-icon timeline-icon">timeline</mat-icon>
              <mat-card-title>{{ t('nav.timeline') }}</mat-card-title>
              <mat-card-subtitle>{{ t('home.timelineDescription') }}</mat-card-subtitle>
            </mat-card-header>
            <mat-card-actions>
              <a mat-flat-button routerLink="/timeline" color="primary">
                <mat-icon>play_arrow</mat-icon>
                {{ t('home.playTimeline') }}
              </a>
            </mat-card-actions>
          </mat-card>
        </div>

        @if (scoreService.quizScore().totalAnswered > 0) {
          <div class="quick-stats">
            <h2>{{ t('home.stats') }}</h2>
            <div class="stats-row">
              <div class="stat-item">
                <span class="stat-value">{{ scoreService.quizScore().totalAnswered }}</span>
                <span class="stat-label">{{ t('home.totalAnswered') }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ scoreService.quizAccuracy() }}%</span>
                <span class="stat-label">{{ t('home.accuracy') }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ scoreService.quizScore().bestStreak }}</span>
                <span class="stat-label">{{ t('home.bestStreak') }}</span>
              </div>
            </div>
          </div>
        }
      </div>
    </ng-container>
  `,
  styles: [`
    .home-container {
      padding: 16px 0;
    }
    .welcome-title {
      font-size: 1.8rem;
      margin: 0 0 8px;
    }
    .welcome-desc {
      color: rgba(0,0,0,0.6);
      margin-bottom: 24px;
    }
    .game-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 16px;
      margin-bottom: 32px;
    }
    .game-card {
      mat-card-actions {
        padding: 16px;
      }
    }
    .card-icon {
      font-size: 28px;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      color: white;
    }
    .quiz-icon { background: #3f51b5; }
    .timeline-icon { background: #ff9800; }

    .quick-stats {
      h2 { font-size: 1.3rem; margin-bottom: 16px; }
    }
    .stats-row {
      display: flex;
      gap: 24px;
      flex-wrap: wrap;
    }
    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 80px;
    }
    .stat-value {
      font-size: 1.8rem;
      font-weight: 600;
    }
    .stat-label {
      font-size: 0.85rem;
      color: rgba(0,0,0,0.6);
    }

    :host-context(body.dark-theme) {
      .welcome-desc, .stat-label {
        color: rgba(255,255,255,0.6);
      }
    }
  `]
})
export class HomeComponent {
  scoreService = inject(ScoreService);
}
