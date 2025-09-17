import { Injectable } from '@angular/core';
import { Lesson } from '../models/lesson';

@Injectable({ providedIn: 'root' })
export class LessonsService {
  getLessonsByLevel(level: number): Lesson[] {
    return [
      { id: 1, title: 'Leçon 1', icon: 'fa-check', status: 'done', category: 'vocabulaire' },
      { id: 2, title: 'Leçon 2', icon: 'fa-lock', status: 'locked', category: 'vocabulaire' },
      { id: 3, title: 'Les lettres', icon: 'fa-check', status: 'done', category: 'grammaire' },
      { id: 4, title: 'Les voyelles', icon: 'fa-circle-play', status: 'unlocked', category: 'grammaire' },
    ];
  }

  getProgress(subjectName: string, level: number): number {
    const lessons = this.getLessonsByLevel(level);
    const completed = lessons.filter(lesson => lesson.completed).length;
    return lessons.length > 0 ? Math.round((completed / lessons.length) * 100) : 0;
  }
  
}
