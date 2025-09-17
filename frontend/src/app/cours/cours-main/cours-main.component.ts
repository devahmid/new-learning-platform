import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseNavigationComponent } from '../../shared/course-navigation/course-navigation.component';
import { CoursListComponent } from '../cours-list/cours-list.component';

@Component({
  selector: 'app-cours-main',
  standalone: true,
  imports: [CommonModule, CourseNavigationComponent, CoursListComponent],
  templateUrl: './cours-main.component.html',
  styleUrls: ['./cours-main.component.scss'],
})
export class CoursMainComponent {
  // Ce composant sert de conteneur principal pour la navigation et la liste des cours
}
