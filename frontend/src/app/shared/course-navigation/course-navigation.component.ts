import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-course-navigation',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-4">
      <h3 class="text-lg font-semibold mb-2">Navigation des Cours</h3>
      <p>Composant de navigation des cours en cours de développement...</p>
    </div>
  `
})
export class CourseNavigationComponent {}
