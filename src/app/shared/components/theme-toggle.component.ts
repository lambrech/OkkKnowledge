import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [MatIconModule, MatButtonModule],
  template: `
    <button mat-icon-button (click)="themeService.toggle()" [attr.aria-label]="'Toggle theme'">
      @switch (themeService.effectiveTheme()) {
        @case ('light') {
          <mat-icon>light_mode</mat-icon>
        }
        @case ('dark') {
          <mat-icon>dark_mode</mat-icon>
        }
      }
    </button>
  `,
})
export class ThemeToggleComponent {
  themeService = inject(ThemeService);
}
