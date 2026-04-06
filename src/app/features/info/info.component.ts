import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { filter } from 'rxjs';
import { QuestionService } from '../../core/services/question.service';

@Component({
  selector: 'app-info',
  standalone: true,
  imports: [
    RouterLink,
    MatCardModule, MatButtonModule, MatIconModule, MatDividerModule, MatSnackBarModule,
    TranslocoDirective,
  ],
  template: `
    <ng-container *transloco="let t">
      <div class="info-page">
        <h1>{{ t('info.title') }}</h1>

        <mat-card appearance="outlined">
          <mat-card-content>
            <div class="info-row">
              <mat-icon>info</mat-icon>
              <div>
                <span class="label">{{ t('info.version') }}</span>
                <span class="value">{{ appVersion }}</span>
              </div>
            </div>
            <mat-divider />
            <div class="info-row">
              <mat-icon>quiz</mat-icon>
              <div>
                <span class="label">{{ t('info.questionCount') }}</span>
                <span class="value">{{ totalQuestions() }} {{ t('info.questions') }}</span>
              </div>
            </div>
            <div class="category-counts">
              @for (cat of categoryCounts(); track cat.category) {
                <span class="cat-chip">{{ t('categories.' + cat.category) }}: {{ cat.count }}</span>
              }
            </div>
            <mat-divider />
            <div class="info-row">
              <mat-icon>timeline</mat-icon>
              <div>
                <span class="label">{{ t('info.timelineCount') }}</span>
                <span class="value">{{ totalTimeline() }} {{ t('info.events') }}</span>
              </div>
            </div>
            <mat-divider />
            <div class="info-row">
              <mat-icon>update</mat-icon>
              <div>
                <span class="label">{{ t('info.swStatus') }}</span>
                <span class="value" [class.sw-active]="swEnabled">
                  {{ swEnabled ? t('info.swActive') : t('info.swInactive') }}
                </span>
              </div>
            </div>
            @if (updateAvailable()) {
              <mat-divider />
              <div class="info-row update-available">
                <mat-icon color="primary">new_releases</mat-icon>
                <span class="value highlight">{{ t('info.updateReady') }}</span>
              </div>
            }
          </mat-card-content>
        </mat-card>

        <h3>{{ t('info.actions') }}</h3>

        <div class="action-buttons">
          <button mat-flat-button color="primary" routerLink="/browse">
            <mat-icon>search</mat-icon>
            {{ t('info.browseQuestions') }}
          </button>

          @if (swEnabled) {
            <button mat-stroked-button (click)="checkForUpdate()" [disabled]="checking()">
              <mat-icon>sync</mat-icon>
              {{ checking() ? t('info.checking') : t('info.checkUpdate') }}
            </button>
          }

          @if (updateAvailable()) {
            <button mat-flat-button color="accent" (click)="activateUpdate()">
              <mat-icon>system_update</mat-icon>
              {{ t('info.installUpdate') }}
            </button>
          }

          <button mat-stroked-button (click)="clearCacheAndReload()">
            <mat-icon>delete_sweep</mat-icon>
            {{ t('info.clearCache') }}
          </button>

          <button mat-stroked-button (click)="reloadApp()">
            <mat-icon>refresh</mat-icon>
            {{ t('info.reload') }}
          </button>
        </div>

        <mat-card appearance="outlined" class="about-card">
          <mat-card-content>
            <p class="about-text">{{ t('info.about') }}</p>
            <p class="tech-stack">Angular 19 | Material M3 | Transloco | PWA</p>
          </mat-card-content>
        </mat-card>
      </div>
    </ng-container>
  `,
  styles: `
    .info-page {
      max-width: 600px;
      margin: 0 auto;
      padding: 16px;
    }
    h1 { margin-bottom: 16px; }
    h3 { margin: 24px 0 12px; }
    .info-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 0;
    }
    .info-row div {
      display: flex;
      flex-direction: column;
    }
    .label {
      font-size: 0.85em;
      opacity: 0.7;
    }
    .value {
      font-weight: 500;
      font-size: 1.1em;
    }
    .category-counts {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      padding: 0 0 12px 36px;
    }
    .cat-chip {
      font-size: 0.82em;
      background: rgba(0, 0, 0, 0.06);
      padding: 2px 10px;
      border-radius: 12px;
    }
    :host-context(body.dark-theme) .cat-chip {
      background: rgba(255, 255, 255, 0.1);
    }
    .sw-active { color: #4caf50; }
    .highlight { color: #ff9800; }
    .update-available {
      background: rgba(255, 152, 0, 0.08);
      border-radius: 8px;
      padding: 12px;
    }
    .action-buttons {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .action-buttons button {
      justify-content: flex-start;
    }
    .action-buttons mat-icon {
      margin-right: 8px;
    }
    .about-card {
      margin-top: 32px;
    }
    .about-text {
      margin: 0 0 8px;
    }
    .tech-stack {
      margin: 0;
      opacity: 0.6;
      font-size: 0.85em;
    }
    mat-divider {
      margin: 0 -16px;
    }
  `,
})
export class InfoComponent implements OnInit {
  private swUpdate = inject(SwUpdate);
  private snackBar = inject(MatSnackBar);
  private transloco = inject(TranslocoService);
  private questionService = inject(QuestionService);

  appVersion = '0.2.0-alpha.1';
  swEnabled = this.swUpdate.isEnabled;
  updateAvailable = signal(false);
  checking = signal(false);

  totalQuestions = signal(0);
  totalTimeline = signal(0);
  categoryCounts = signal<{ category: string; count: number }[]>([]);

  ngOnInit(): void {
    const questions = this.questionService.questions();
    const timeline = this.questionService.timelineEvents();
    this.totalQuestions.set(questions.length);
    this.totalTimeline.set(timeline.length);

    const counts = new Map<string, number>();
    for (const q of questions) {
      counts.set(q.category, (counts.get(q.category) || 0) + 1);
    }
    this.categoryCounts.set(
      Array.from(counts.entries()).map(([category, count]) => ({ category, count }))
    );

    if (this.swEnabled) {
      this.swUpdate.versionUpdates.pipe(
        filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY')
      ).subscribe(() => {
        this.updateAvailable.set(true);
      });
    }
  }

  async checkForUpdate(): Promise<void> {
    if (!this.swEnabled) return;
    this.checking.set(true);
    try {
      const hasUpdate = await this.swUpdate.checkForUpdate();
      if (hasUpdate) {
        this.updateAvailable.set(true);
        this.snackBar.open(this.transloco.translate('info.updateFound'), '', { duration: 3000 });
      } else {
        this.snackBar.open(this.transloco.translate('info.upToDate'), '', { duration: 3000 });
      }
    } catch {
      this.snackBar.open(this.transloco.translate('info.checkFailed'), '', { duration: 3000 });
    } finally {
      this.checking.set(false);
    }
  }

  async activateUpdate(): Promise<void> {
    if (!this.swEnabled) return;
    try {
      await this.swUpdate.activateUpdate();
      document.location.reload();
    } catch {
      this.snackBar.open(this.transloco.translate('info.checkFailed'), '', { duration: 3000 });
    }
  }

  async clearCacheAndReload(): Promise<void> {
    if ('caches' in window) {
      const names = await caches.keys();
      await Promise.all(names.map(name => caches.delete(name)));
    }
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(reg => reg.unregister()));
    }
    this.snackBar.open(this.transloco.translate('info.cacheCleared'), '', { duration: 2000 });
    setTimeout(() => document.location.reload(), 1500);
  }

  reloadApp(): void {
    document.location.reload();
  }
}
