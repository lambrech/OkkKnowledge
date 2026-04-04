import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { ScoreService } from '../../core/services/score.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    MatCardModule, MatButtonModule, MatButtonToggleModule, MatIconModule,
    MatExpansionModule, MatSnackBarModule,
    TranslocoDirective,
  ],
  template: `
    <ng-container *transloco="let t">
      <h1>{{ t('settings.title') }}</h1>

      <mat-card appearance="outlined" class="settings-card">
        <mat-card-content>
          <h3>{{ t('settings.language') }}</h3>
          <mat-button-toggle-group [value]="transloco.getActiveLang()"
                                   (change)="setLanguage($event.value)">
            <mat-button-toggle value="de">Deutsch</mat-button-toggle>
            <mat-button-toggle value="en">English</mat-button-toggle>
          </mat-button-toggle-group>
        </mat-card-content>
      </mat-card>

      <mat-card appearance="outlined" class="settings-card">
        <mat-card-content>
          <h3>{{ t('settings.theme') }}</h3>
          <mat-button-toggle-group [value]="themeService.theme()"
                                   (change)="themeService.setTheme($event.value)">
            <mat-button-toggle value="light">{{ t('settings.themeLight') }}</mat-button-toggle>
            <mat-button-toggle value="dark">{{ t('settings.themeDark') }}</mat-button-toggle>
            <mat-button-toggle value="system">{{ t('settings.themeSystem') }}</mat-button-toggle>
          </mat-button-toggle-group>
        </mat-card-content>
      </mat-card>

      <mat-card appearance="outlined" class="settings-card">
        <mat-card-content>
          <h3>{{ t('settings.resetProgress') }}</h3>
          <mat-expansion-panel>
            <mat-expansion-panel-header>
              <mat-panel-title>{{ t('settings.resetProgress') }}</mat-panel-title>
            </mat-expansion-panel-header>
            <p class="reset-warning">{{ t('settings.resetConfirm') }}</p>
            <div class="reset-buttons">
              <button mat-stroked-button color="warn" (click)="resetQuiz(t)">
                {{ t('settings.resetQuiz') }}
              </button>
              <button mat-stroked-button color="warn" (click)="resetTimeline(t)">
                {{ t('settings.resetTimeline') }}
              </button>
              <button mat-flat-button color="warn" (click)="resetAll(t)">
                {{ t('settings.resetAll') }}
              </button>
            </div>
          </mat-expansion-panel>
        </mat-card-content>
      </mat-card>
    </ng-container>
  `,
  styles: [`
    .settings-card {
      margin-bottom: 16px;

      h3 {
        margin-bottom: 12px;
      }
    }

    .reset-warning {
      color: #f44336;
      margin-bottom: 16px;
    }

    .reset-buttons {
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-width: 300px;
    }
  `]
})
export class SettingsComponent {
  private scoreService = inject(ScoreService);
  private snackBar = inject(MatSnackBar);
  transloco = inject(TranslocoService);
  themeService = inject(ThemeService);

  setLanguage(lang: string): void {
    this.transloco.setActiveLang(lang);
    this.scoreService.setLanguage(lang as 'de' | 'en');
  }

  resetQuiz(t: (key: string) => string): void {
    this.scoreService.resetQuiz();
    this.snackBar.open(t('settings.resetDone'), '', { duration: 2000 });
  }

  resetTimeline(t: (key: string) => string): void {
    this.scoreService.resetTimeline();
    this.snackBar.open(t('settings.resetDone'), '', { duration: 2000 });
  }

  resetAll(t: (key: string) => string): void {
    this.scoreService.resetAll();
    this.snackBar.open(t('settings.resetDone'), '', { duration: 2000 });
  }
}
