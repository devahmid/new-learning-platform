import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '../../admin.service';

@Component({
  selector: 'app-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view.component.html',
  styles: [],
})
export class ViewComponent implements OnInit {
  course: any = null;
  isLoading = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminService: AdminService
  ) {}

  ngOnInit() {
    const courseId = this.route.snapshot.paramMap.get('id');
    if (courseId) {
      this.loadCourse(Number(courseId));
    }
  }

  private async loadCourse(courseId: number) {
    try {
      this.isLoading = true;
      this.error = null;

      const course = await this.adminService.getCourseById(courseId).toPromise();
      this.course = course;
    } catch (error) {
      console.error('Erreur lors du chargement du cours:', error);
      this.error = 'Erreur lors du chargement du cours';
    } finally {
      this.isLoading = false;
    }
  }

  goBack() {
    this.router.navigate(['/admin/courses/liste']);
  }

  editCourse() {
    if (this.course) {
      this.router.navigate(['/admin/courses/edit', this.course.id]);
    }
  }
}
