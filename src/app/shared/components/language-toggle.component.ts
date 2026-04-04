import { Component, inject } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { MatButtonModule } from '@angular/material/button';
import { AsyncPipe } from '@angular/common';
import { ScoreService } from '../../core/services/score.service';

@Component({
  selector: 'app-language-toggle',
  standalone: true,
  imports: [MatButtonModule, AsyncPipe],
  template: `
    <button mat-button (click)="toggle()" class="lang-toggle">
      {{ (currentLang | async) === 'de' ? 'DE' : 'EN' }}
    </button>
  `,
  styles: [`
    .lang-toggle {
      min-width: 48px;
      font-weight: 500;
    }
  `]
})
export class LanguageToggleComponent {
  private transloco = inject(TranslocoService);
  private scoreService = inject(ScoreService);

  currentLang = this.transloco.langChanges$;

  toggle(): void {
    const next = this.transloco.getActiveLang() === 'de' ? 'en' : 'de';
    this.transloco.setActiveLang(next);
    this.scoreService.setLanguage(next);
  }
}
