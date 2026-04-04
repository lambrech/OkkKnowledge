import { Injectable, inject, signal, computed, effect, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { ScoreService } from './score.service';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private document = inject(DOCUMENT);
  private scoreService = inject(ScoreService);
  private platformId = inject(PLATFORM_ID);

  readonly theme = computed(() => this.scoreService.userProgress().theme);

  readonly effectiveTheme = computed(() => {
    const t = this.theme();
    if (t === 'system' && isPlatformBrowser(this.platformId)) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return t === 'system' ? 'light' : t;
  });

  constructor() {
    effect(() => {
      const theme = this.effectiveTheme();
      this.document.body.classList.toggle('dark-theme', theme === 'dark');
    });
  }

  toggle(): void {
    const current = this.theme();
    const next = current === 'light' ? 'dark' : current === 'dark' ? 'system' : 'light';
    this.scoreService.setTheme(next);
  }

  setTheme(t: 'light' | 'dark' | 'system'): void {
    this.scoreService.setTheme(t);
  }
}
