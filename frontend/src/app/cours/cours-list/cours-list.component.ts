import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { SubjectService } from '../../services/subject.service';
import { CourseService } from '../../services/course.service';
import { Course } from '../../models/course.model';
import { ChildContextService } from '../../_children-context/_children-context/child-context.service';

@Component({
  selector: 'app-cours-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cours-list.component.html',
})
export class CoursListComponent implements OnInit {
  level = 1;
  subjectData: any = null;
  courses: Course[] = [];
  isLoading = true;
  error: string | null = null;
  totalCourses = 0;

  constructor(
    private courseService: CourseService,
    private subjectService: SubjectService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private childContext: ChildContextService
  ) {}

  ngOnInit() {
    // Vérifier qu'un enfant est sélectionné
    const selectedChild = this.childContext.selectedChild();
    if (!selectedChild) {
      console.log('Aucun enfant sélectionné - Redirection vers no-children-info');
      this.router.navigate(['/no-children-info']);
      return;
    }

    this.level = Number(this.route.snapshot.paramMap.get('level')) || 1;
    const subjectName = this.route.snapshot.paramMap.get('subject');

    if (subjectName) {
      this.subjectData = this.subjectService.getSubjectByName(subjectName);
    }

    if (this.level && this.subjectData) {
      this.loadCourses();
    } else {
      this.error = 'Paramètres manquants';
      this.isLoading = false;
    }
  }

  loadCourses() {
    this.isLoading = true;
    this.error = null;

    // Récupérer l'enfant sélectionné pour obtenir sa classe
    const selectedChild = this.childContext.selectedChild();
    if (!selectedChild || !selectedChild.classeId) {
      console.error('Aucun enfant sélectionné ou classe manquante');
      this.error = 'Classe non trouvée';
      this.isLoading = false;
      return;
    }

    this.courseService.getCoursesByClasse(selectedChild.classeId).subscribe({
      next: (courses: any[]) => {
        console.log("Cours récupérés depuis l'API pour la classe:", selectedChild.classeId, courses);
        this.courses = courses;
        this.totalCourses = courses.length;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des cours:', err);
        this.error = 'Erreur lors du chargement des cours';
        this.isLoading = false;
      },
    });
  }

  // Méthode supprimée - plus de données mockées

  voirDetails(course: Course) {
    // Navigation vers les leçons du cours
    this.router.navigate([
      '/cours',
      this.subjectData?.name?.toLowerCase(),
      this.level,
      'course',
      course.id,
    ]);
  }

  goBack() {
    this.location.back();
  }
}
