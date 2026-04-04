import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { LanguageToggleComponent } from './shared/components/language-toggle.component';
import { ThemeToggleComponent } from './shared/components/theme-toggle.component';
import { ScoreService } from './core/services/score.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive,
    MatToolbarModule, MatButtonModule, MatIconModule, MatSidenavModule, MatListModule,
    TranslocoDirective,
    LanguageToggleComponent, ThemeToggleComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  sidenavOpened = signal(false);

  private score = inject(ScoreService);
  private transloco = inject(TranslocoService);

  constructor() {
    const lang = this.score.userProgress().preferredLanguage;
    if (lang && lang !== this.transloco.getActiveLang()) {
      this.transloco.setActiveLang(lang);
    }
  }
}
