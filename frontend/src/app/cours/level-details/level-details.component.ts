import { Component } from '@angular/core';
import { Lesson } from '../../models/lesson';
import { ActivatedRoute, Router } from '@angular/router';
import { LessonsService } from '../../data/lessons.service';

@Component({
  selector: 'app-level-details',
  standalone: true,
  imports: [],
  templateUrl: './level-details.component.html',
  styleUrl: './level-details.component.scss'
})
export class LevelDetailsComponent {
  level = 1;
  progress = 0; // Progression réelle depuis l'API
  vocabularyLessons: Lesson[] = [];
  grammarLessons: Lesson[] = [];

  constructor(private route: ActivatedRoute, private router: Router, private lessonsService: LessonsService) {
    const param = this.route.snapshot.paramMap.get('level');
    this.level = param ? +param : 1;
    const lessons = this.lessonsService.getLessonsByLevel(this.level);
    this.vocabularyLessons = lessons.filter(l => l.category === 'vocabulaire');
    this.grammarLessons = lessons.filter(l => l.category === 'grammaire');
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
