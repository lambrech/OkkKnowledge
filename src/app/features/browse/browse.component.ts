import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { LocalizedTextPipe } from '../../shared/pipes/localized-text.pipe';
import { QuestionService } from '../../core/services/question.service';
import { Question, TimelineEvent, Category } from '../../core/models/question.model';

type ItemType = 'questions' | 'timeline';

@Component({
  selector: 'app-browse',
  standalone: true,
  imports: [
    FormsModule, RouterLink,
    MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule,
    MatInputModule, MatChipsModule, MatBadgeModule,
    TranslocoDirective, LocalizedTextPipe,
  ],
  template: `
    <ng-container *transloco="let t">
      <div class="browse-page">
        <div class="browse-header">
          <button mat-icon-button routerLink="/info">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <h1>{{ t('browse.title') }}</h1>
        </div>

        <div class="type-toggle">
          <button mat-stroked-button [class.active]="itemType() === 'questions'" (click)="itemType.set('questions')">
            <mat-icon>quiz</mat-icon>
            {{ t('browse.questions') }} ({{ questionService.questions().length }})
          </button>
          <button mat-stroked-button [class.active]="itemType() === 'timeline'" (click)="itemType.set('timeline')">
            <mat-icon>timeline</mat-icon>
            {{ t('browse.timeline') }} ({{ questionService.timelineEvents().length }})
          </button>
        </div>

        <mat-form-field appearance="outline" class="search-field">
          <mat-label>{{ t('browse.search') }}</mat-label>
          <input matInput [(ngModel)]="searchTerm" (ngModelChange)="onSearch($event)">
          <mat-icon matPrefix>search</mat-icon>
          @if (searchTerm) {
            <button matSuffix mat-icon-button (click)="searchTerm = ''; onSearch('')">
              <mat-icon>clear</mat-icon>
            </button>
          }
        </mat-form-field>

        <div class="category-filter">
          @for (cat of categories; track cat) {
            <button mat-stroked-button [class.selected]="selectedCategories().has(cat)"
                    (click)="toggleCategory(cat)">
              {{ t('categories.' + cat) }}
            </button>
          }
        </div>

        <p class="result-count">{{ filteredItems().length }} {{ t('browse.results') }}</p>

        <div class="results-list">
          @if (itemType() === 'questions') {
            @for (q of paginatedItems(); track q.id) {
              <mat-card appearance="outlined" class="question-card">
                <mat-card-content>
                  <div class="q-header">
                    <span class="q-id">{{ q.id }}</span>
                    <span class="q-cat">{{ t('categories.' + q.category) }}</span>
                    <span class="q-diff" [attr.data-diff]="asQuestion(q).difficulty">{{ asQuestion(q).difficulty }}</span>
                  </div>
                  <p class="q-text">{{ asQuestion(q).question | localizedText }}</p>
                  @if (asQuestion(q).type === 'flag' && asQuestion(q).flagCode) {
                    <img [src]="'assets/flags/' + asQuestion(q).flagCode + '.svg'" class="q-flag-preview" />
                  }
                  @if (asQuestion(q).type === 'map') {
                    <span class="q-type-badge">Map</span>
                  }
                  <div class="q-options">
                    @for (opt of asQuestion(q).options; track $index) {
                      <span class="q-option" [class.correct]="$index === asQuestion(q).correctIndex">
                        {{ opt | localizedText }}
                        @if ($index === asQuestion(q).correctIndex) {
                          <mat-icon>check</mat-icon>
                        }
                      </span>
                    }
                  </div>
                  @if (asQuestion(q).sourceUrl) {
                    <a class="source-link" [href]="asQuestion(q).sourceUrl" target="_blank" rel="noopener">
                      <mat-icon>open_in_new</mat-icon>
                      {{ asQuestion(q).sourceLabel || 'Source' }}
                    </a>
                  }
                </mat-card-content>
              </mat-card>
            }
          } @else {
            @for (ev of paginatedItems(); track ev.id) {
              <mat-card appearance="outlined" class="question-card">
                <mat-card-content>
                  <div class="q-header">
                    <span class="q-id">{{ ev.id }}</span>
                    <span class="q-cat">{{ t('categories.' + ev.category) }}</span>
                    <span class="q-year">{{ asTimeline(ev).year }}</span>
                  </div>
                  <p class="q-text">{{ asTimeline(ev).title | localizedText }}</p>
                  <p class="q-desc">{{ asTimeline(ev).description | localizedText }}</p>
                  @if (asTimeline(ev).sourceUrl) {
                    <a class="source-link" [href]="asTimeline(ev).sourceUrl" target="_blank" rel="noopener">
                      <mat-icon>open_in_new</mat-icon>
                      Wikipedia
                    </a>
                  }
                </mat-card-content>
              </mat-card>
            }
          }
        </div>

        @if (filteredItems().length > displayCount()) {
          <button mat-flat-button class="load-more" (click)="loadMore()">
            {{ t('browse.loadMore') }} ({{ filteredItems().length - displayCount() }} {{ t('browse.remaining') }})
          </button>
        }
      </div>
    </ng-container>
  `,
  styles: `
    .browse-page {
      max-width: 700px;
      margin: 0 auto;
      padding: 16px;
    }
    .browse-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
    }
    .browse-header h1 { margin: 0; }
    .type-toggle {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
    }
    .type-toggle button.active {
      background: var(--mat-sys-primary-container, rgba(103, 80, 164, 0.12));
      color: var(--mat-sys-on-primary-container, #1d192b);
    }
    .search-field {
      width: 100%;
    }
    .category-filter {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 12px;
    }
    .category-filter button {
      font-size: 0.85em;
    }
    .category-filter button.selected {
      background: var(--mat-sys-primary-container, rgba(103, 80, 164, 0.12));
    }
    .result-count {
      opacity: 0.7;
      font-size: 0.9em;
      margin: 0 0 12px;
    }
    .results-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .question-card {
      .q-header {
        display: flex;
        gap: 8px;
        align-items: center;
        margin-bottom: 8px;
      }
      .q-id {
        font-family: monospace;
        font-size: 0.8em;
        opacity: 0.5;
      }
      .q-cat {
        font-size: 0.78em;
        background: rgba(0, 0, 0, 0.06);
        padding: 2px 8px;
        border-radius: 10px;
      }
      .q-diff {
        font-size: 0.78em;
        padding: 2px 8px;
        border-radius: 10px;
      }
      .q-diff[data-diff="easy"] { background: #e8f5e9; color: #2e7d32; }
      .q-diff[data-diff="medium"] { background: #fff3e0; color: #ef6c00; }
      .q-diff[data-diff="hard"] { background: #fce4ec; color: #c62828; }
      .q-year {
        font-weight: 600;
        color: var(--mat-sys-primary, #6750a4);
      }
      .q-text {
        font-weight: 500;
        margin: 0 0 8px;
      }
      .q-flag-preview {
        max-width: 80px;
        max-height: 50px;
        margin-bottom: 8px;
        border: 1px solid rgba(0, 0, 0, 0.08);
        border-radius: 2px;
      }
      .q-type-badge {
        font-size: 0.75em;
        background: #e3f2fd;
        color: #1565c0;
        padding: 2px 8px;
        border-radius: 10px;
        margin-bottom: 8px;
        display: inline-block;
      }
      .q-desc {
        margin: 0 0 8px;
        opacity: 0.8;
        font-size: 0.92em;
      }
      .q-options {
        display: flex;
        flex-direction: column;
        gap: 4px;
        margin-bottom: 8px;
      }
      .q-option {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 0.9em;
        padding: 4px 8px;
        border-radius: 6px;
        background: rgba(0, 0, 0, 0.03);
      }
      .q-option.correct {
        background: rgba(76, 175, 80, 0.12);
        font-weight: 500;
      }
      .q-option mat-icon {
        font-size: 16px;
        height: 16px;
        width: 16px;
        color: #4caf50;
      }
      .source-link {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 0.82em;
        opacity: 0.7;
        text-decoration: none;
        color: inherit;
      }
      .source-link:hover {
        opacity: 1;
      }
      .source-link mat-icon {
        font-size: 14px;
        height: 14px;
        width: 14px;
      }
    }
    :host-context(body.dark-theme) .q-cat {
      background: rgba(255, 255, 255, 0.1);
    }
    :host-context(body.dark-theme) .q-option {
      background: rgba(255, 255, 255, 0.05);
    }
    :host-context(body.dark-theme) .q-option.correct {
      background: rgba(76, 175, 80, 0.15);
    }
    :host-context(body.dark-theme) .q-diff[data-diff="easy"] { background: #1b5e20; color: #a5d6a7; }
    :host-context(body.dark-theme) .q-diff[data-diff="medium"] { background: #e65100; color: #ffcc80; }
    :host-context(body.dark-theme) .q-diff[data-diff="hard"] { background: #b71c1c; color: #ef9a9a; }
    :host-context(body.dark-theme) .q-type-badge { background: #0d47a1; color: #90caf9; }
    :host-context(body.dark-theme) .q-flag-preview { border-color: rgba(255, 255, 255, 0.12); }
    .load-more {
      width: 100%;
      margin-top: 16px;
    }
  `,
})
export class BrowseComponent {
  questionService = inject(QuestionService);
  private transloco = inject(TranslocoService);

  searchTerm = '';
  itemType = signal<ItemType>('questions');
  searchQuery = signal('');
  selectedCategories = signal(new Set<Category>());
  displayCount = signal(50);

  categories: Category[] = ['geography', 'history', 'famous-people', 'science-tech', 'flags', 'capitals', 'map'];

  filteredItems = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const cats = this.selectedCategories();
    const lang = this.transloco.getActiveLang() as 'de' | 'en';

    if (this.itemType() === 'questions') {
      let items = this.questionService.questions();
      if (cats.size > 0) items = items.filter(q => cats.has(q.category));
      if (query) {
        items = items.filter(q =>
          q.question[lang].toLowerCase().includes(query) ||
          q.options.some(o => o[lang].toLowerCase().includes(query)) ||
          q.id.toLowerCase().includes(query)
        );
      }
      return items;
    } else {
      let items = this.questionService.timelineEvents();
      if (cats.size > 0) items = items.filter(e => cats.has(e.category));
      if (query) {
        items = items.filter(e =>
          e.title[lang].toLowerCase().includes(query) ||
          e.description[lang].toLowerCase().includes(query) ||
          e.year.toString().includes(query) ||
          e.id.toLowerCase().includes(query)
        );
      }
      return items;
    }
  });

  paginatedItems = computed(() => this.filteredItems().slice(0, this.displayCount()));

  onSearch(term: string): void {
    this.searchQuery.set(term);
    this.displayCount.set(50);
  }

  toggleCategory(cat: Category): void {
    const current = new Set(this.selectedCategories());
    if (current.has(cat)) {
      current.delete(cat);
    } else {
      current.add(cat);
    }
    this.selectedCategories.set(current);
    this.displayCount.set(50);
  }

  loadMore(): void {
    this.displayCount.update(c => c + 50);
  }

  asQuestion(item: any): Question {
    return item as Question;
  }

  asTimeline(item: any): TimelineEvent {
    return item as TimelineEvent;
  }
}
