import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { EvaluationService } from '../../services/evaluation.service';
import { Evaluation } from '../../models/evaluation.model';
import { ChildContextService } from '../../_children-context/_children-context/child-context.service';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-evaluation-general-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    ButtonModule,
    TagModule
  ],
  templateUrl: './evaluation-general-list.component.html',
  styleUrl: './evaluation-general-list.component.scss'
})
export class EvaluationGeneralListComponent implements OnInit {
  evaluations: Evaluation[] = [];
  isLoading = false;

  constructor(
    private evaluationService: EvaluationService,
    private childContext: ChildContextService,
    public router: Router
  ) {}

  ngOnInit() {
    this.loadEvaluations();
  }

  loadEvaluations() {
    this.isLoading = true;
    this.evaluationService.getAllEvaluations().subscribe({
      next: (evaluations: Evaluation[]) => {
        const currentChild = this.childContext.selectedChild();
        const childClasseId = currentChild?.classeId;
        
        // Filtrer uniquement les évaluations générales (sans cours ni leçon) et actives
        let filteredEvaluations = evaluations.filter(evaluation => 
          evaluation.isActive && 
          !evaluation.courseId && 
          !evaluation.lessonId
        );
        
        // Si un enfant est sélectionné, filtrer par sa classe
        if (currentChild && childClasseId) {
          filteredEvaluations = filteredEvaluations.filter(evaluation => {
            // Si l'évaluation n'a pas de classes spécifiées, elle est accessible à tous
            if (!evaluation.classes || evaluation.classes.length === 0) {
              return true;
            }
            // Sinon, vérifier si la classe de l'enfant est dans la liste
            return evaluation.classes.some((c: any) => c.id === childClasseId);
          });
        }
        
        this.evaluations = filteredEvaluations;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des évaluations:', err);
        this.isLoading = false;
      }
    });
  }

  takeEvaluation(evaluationId: number) {
    this.router.navigate(['/evaluations', evaluationId]);
  }
}

