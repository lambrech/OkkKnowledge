import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
    title: 'WissensApp',
  },
  {
    path: 'quiz',
    loadComponent: () => import('./features/quiz/quiz.component').then(m => m.QuizComponent),
    title: 'Quiz',
  },
  {
    path: 'timeline',
    loadComponent: () => import('./features/timeline/timeline.component').then(m => m.TimelineComponent),
    title: 'Timeline',
  },
  {
    path: 'stats',
    loadComponent: () => import('./features/stats/stats.component').then(m => m.StatsComponent),
    title: 'Statistics',
  },
  {
    path: 'settings',
    loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent),
    title: 'Settings',
  },
  { path: '**', redirectTo: '' },
];
