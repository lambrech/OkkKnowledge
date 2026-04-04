import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, tap } from 'rxjs';
import { Question, TimelineEvent, Category, CategoryData } from '../models/question.model';

@Injectable({ providedIn: 'root' })
export class QuestionService {
  private http = inject(HttpClient);

  private allQuestions = signal<Question[]>([]);
  private allTimelineEvents = signal<TimelineEvent[]>([]);
  private loaded = signal(false);

  readonly questions = this.allQuestions.asReadonly();
  readonly timelineEvents = this.allTimelineEvents.asReadonly();
  readonly isLoaded = this.loaded.asReadonly();

  private readonly DATA_FILES: string[] = [
    'assets/data/geography.json',
    'assets/data/history.json',
    'assets/data/famous-people.json',
    'assets/data/science-tech.json',
  ];

  loadAll(): Promise<void> {
    return new Promise((resolve, reject) => {
      forkJoin(
        this.DATA_FILES.map(file => this.http.get<CategoryData>(file))
      ).pipe(
        tap(results => {
          const questions: Question[] = [];
          const events: TimelineEvent[] = [];
          for (const data of results) {
            questions.push(...data.questions);
            events.push(...data.timelineEvents);
          }
          this.allQuestions.set(questions);
          this.allTimelineEvents.set(events);
          this.loaded.set(true);
        })
      ).subscribe({ next: () => resolve(), error: (err) => reject(err) });
    });
  }

  getByCategory(category: Category): Question[] {
    return this.allQuestions().filter(q => q.category === category);
  }

  getRandomQuestions(count: number, categories?: Category[], excludeIds?: string[]): Question[] {
    let pool = this.allQuestions();
    if (categories?.length) {
      pool = pool.filter(q => categories.includes(q.category));
    }
    if (excludeIds?.length) {
      pool = pool.filter(q => !excludeIds.includes(q.id));
    }
    return this.shuffle([...pool]).slice(0, count);
  }

  getTimelineEvents(count: number): TimelineEvent[] {
    return this.shuffle([...this.allTimelineEvents()]).slice(0, count);
  }

  private shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}
