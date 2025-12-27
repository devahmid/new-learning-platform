import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { EvaluationService } from '../../services/evaluation.service';
import { Evaluation, EvaluationQuestion, EvaluationSection, EvaluationResponse, QuestionResponse } from '../../models/evaluation.model';
import { MessageService } from 'primeng/api';
import { ChildContextService } from '../../_children-context/_children-context/child-context.service';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CheckboxModule } from 'primeng/checkbox';
import { RatingModule } from 'primeng/rating';
import { CardModule } from 'primeng/card';
import { ProgressBarModule } from 'primeng/progressbar';

@Component({
  selector: 'app-evaluation-take',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ToastModule,
    ButtonModule,
    InputTextModule,
    InputTextareaModule,
    RadioButtonModule,
    CheckboxModule,
    RatingModule,
    CardModule,
    ProgressBarModule
  ],
  templateUrl: './evaluation-take.component.html',
  styleUrl: './evaluation-take.component.scss'
})
export class EvaluationTakeComponent implements OnInit {
  evaluationForm: FormGroup;
  evaluation: Evaluation | null = null;
  isLoading = false;
  isSubmitting = false;
  isSubmitted = false;
  evaluationId: number | null = null;
  currentQuestionIndex = 0;
  showProgress = true;
  questionsBySection: { [sectionId: number]: EvaluationQuestion[] } = {};
  questionsWithoutSection: EvaluationQuestion[] = [];
  sections: EvaluationSection[] = [];
  safeInstructions?: SafeHtml;
  sortedQuestions: EvaluationQuestion[] = []; // Questions triées pour navigation
  currentQuestion: EvaluationQuestion | null = null; // Question actuelle mise en cache

  router: Router;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    router: Router,
    private evaluationService: EvaluationService,
    private messageService: MessageService,
    private sanitizer: DomSanitizer,
    public childContext: ChildContextService
  ) {
    this.router = router;
    this.evaluationForm = this.fb.group({
      responses: this.fb.array([])
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.evaluationId = +id;
      this.loadEvaluation(+id);
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'ID d\'évaluation manquant'
      });
      this.router.navigate(['/']);
    }
  }

  loadEvaluation(id: number) {
    console.log('Chargement de l\'évaluation avec ID:', id);
    this.isLoading = true;
    this.evaluationService.getEvaluationById(id).subscribe({
      next: (evaluation) => {
        console.log('Évaluation chargée:', evaluation);
        if (!evaluation || !evaluation.id) {
          console.error('Évaluation invalide reçue:', evaluation);
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'L\'évaluation chargée est invalide'
          });
          this.router.navigate(['/matières']);
          this.isLoading = false;
          return;
        }
        
        this.evaluation = evaluation;
        
        // Sanitizer les instructions HTML
        if (evaluation.instructions) {
          this.safeInstructions = this.sanitizer.bypassSecurityTrustHtml(evaluation.instructions);
        }
        
        // Organiser les sections
        this.sections = (evaluation.sections || []).sort((a, b) => a.order - b.order);
        
        // Organiser les questions par section
        this.organizeQuestionsBySection(evaluation);
        
        // Vérifier si l'évaluation est active
        if (!evaluation.isActive) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Évaluation inactive',
            detail: 'Cette évaluation n\'est pas active'
          });
          this.router.navigate(['/matières']);
          this.isLoading = false;
          return;
        }
        
        // Vérifier les dates (avertissement mais pas de blocage)
        const now = new Date();
        if (evaluation.startDate && new Date(evaluation.startDate) > now) {
          const startDate = new Date(evaluation.startDate);
          this.messageService.add({
            severity: 'info',
            summary: 'Évaluation à venir',
            detail: `Cette évaluation sera disponible à partir du ${startDate.toLocaleDateString('fr-FR')} à ${startDate.toLocaleTimeString('fr-FR')}`
          });
          // On continue quand même pour permettre l'accès
        }
        
        if (evaluation.endDate && new Date(evaluation.endDate) < now) {
          const endDate = new Date(evaluation.endDate);
          this.messageService.add({
            severity: 'warn',
            summary: 'Évaluation terminée',
            detail: `Cette évaluation s'est terminée le ${endDate.toLocaleDateString('fr-FR')}`
          });
          // On continue quand même pour permettre la consultation
        }

        // Initialiser le formulaire avec les questions
        const responsesArray = this.evaluationForm.get('responses') as FormArray;
        responsesArray.clear();

        const sortedQuestions = [...evaluation.questions].sort((a, b) => {
          // Trier d'abord par section, puis par ordre
          const sectionA = a.sectionId || 0;
          const sectionB = b.sectionId || 0;
          if (sectionA !== sectionB) {
            return sectionA - sectionB;
          }
          return a.order - b.order;
        });
        
        // Stocker les questions triées pour la navigation
        this.sortedQuestions = sortedQuestions;
        
        console.log('Questions triées:', sortedQuestions);
        console.log('Nombre de questions:', sortedQuestions.length);
        
        sortedQuestions.forEach((question, index) => {
          console.log(`Initialisation question ${index}:`, question);
            const validators = question.required ? [Validators.required] : [];
            
            if (question.type === 'checkbox') {
              // Pour les checkboxes, on crée un FormGroup avec des FormControls pour chaque option
              const checkboxGroup = this.fb.group({});
              question.options?.forEach((option, optIndex) => {
                checkboxGroup.addControl(`option_${optIndex}`, this.fb.control(false));
              });
              if (question.required) {
                checkboxGroup.setValidators([Validators.required]);
              }
              responsesArray.push(this.fb.group({
                questionId: [question.id],
                value: checkboxGroup
              }));
            } else if (question.type === 'rating') {
              responsesArray.push(this.fb.group({
                questionId: [question.id],
                value: [null, validators]
              }));
            } else {
              responsesArray.push(this.fb.group({
                questionId: [question.id],
                value: ['', validators],
                textValue: ['']
              }));
            }
          });

        console.log('FormArray après initialisation:', this.responsesFormArray);
        console.log('Nombre de FormGroups:', this.responsesFormArray.length);
        console.log('currentQuestionIndex:', this.currentQuestionIndex);
        this.currentQuestion = this.getQuestion(this.currentQuestionIndex);
        console.log('Question actuelle:', this.currentQuestion);
        console.log('FormGroup actuel:', this.getQuestionFormGroup(this.currentQuestionIndex));
        
        // Vérifier que toutes les questions ont leurs options
        sortedQuestions.forEach((question, index) => {
          console.log(`Question ${index} (ID: ${question.id}):`, {
            text: question.text,
            type: question.type,
            options: question.options,
            optionsLength: question.options?.length || 0
          });
        });

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement de l\'évaluation:', err);
        console.error('ID utilisé:', id);
        console.error('Status:', err.status);
        console.error('Message:', err.message);
        
        let errorMessage = 'Impossible de charger l\'évaluation';
        if (err.status === 404) {
          errorMessage = 'Évaluation non trouvée. L\'ID ' + id + ' n\'existe pas.';
        } else if (err.status === 403) {
          errorMessage = 'Vous n\'avez pas l\'autorisation d\'accéder à cette évaluation';
        } else if (err.status === 0) {
          errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion.';
        }
        
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: errorMessage
        });
        this.isLoading = false;
        
        // Rediriger vers les matières après 2 secondes
        setTimeout(() => {
          this.router.navigate(['/matières']);
        }, 2000);
      }
    });
  }

  isEvaluationAvailable(evaluation: Evaluation): boolean {
    if (!evaluation.isActive) {
      return false;
    }

    const now = new Date();
    
    if (evaluation.startDate && new Date(evaluation.startDate) > now) {
      return false;
    }

    if (evaluation.endDate && new Date(evaluation.endDate) < now) {
      return false;
    }

    return true;
  }

  get responsesFormArray(): FormArray {
    return this.evaluationForm.get('responses') as FormArray;
  }

  getQuestion(index: number): EvaluationQuestion | null {
    if (!this.evaluation) {
      console.log('getQuestion: pas d\'évaluation');
      return null;
    }
    // Utiliser les questions triées stockées si disponibles, sinon trier à nouveau
    const sortedQuestions = this.sortedQuestions.length > 0 
      ? this.sortedQuestions 
      : [...this.evaluation.questions].sort((a, b) => {
          const sectionA = a.sectionId || 0;
          const sectionB = b.sectionId || 0;
          if (sectionA !== sectionB) {
            return sectionA - sectionB;
          }
          return a.order - b.order;
        });
    const question = sortedQuestions[index] || null;
    console.log(`getQuestion(${index}):`, question, 'sur', sortedQuestions.length);
    if (question) {
      console.log(`  - Type: ${question.type}, Options: ${question.options?.length || 0}`);
    }
    return question;
  }
  
  getCurrentQuestion(): EvaluationQuestion | null {
    const question = this.getQuestion(this.currentQuestionIndex);
    console.log('getCurrentQuestion() appelé, currentQuestionIndex:', this.currentQuestionIndex, 'question:', question);
    return question;
  }
  
  getSectionForQuestion(question: EvaluationQuestion | null): EvaluationSection | null {
    if (!question || !question.sectionId) {
      return null;
    }
    return this.sections.find(s => s.id === question.sectionId) || null;
  }

  getQuestionFormGroup(index: number): FormGroup {
    return this.responsesFormArray.at(index) as FormGroup;
  }

  getQuestionIndex(questionId: number): number {
    if (!this.evaluation) return -1;
    const sortedQuestions = [...this.evaluation.questions].sort((a, b) => {
      const sectionA = a.sectionId || 0;
      const sectionB = b.sectionId || 0;
      if (sectionA !== sectionB) {
        return sectionA - sectionB;
      }
      return a.order - b.order;
    });
    return sortedQuestions.findIndex(q => q.id === questionId);
  }

  getProgress(): number {
    if (!this.evaluation) return 0;
    const total = this.evaluation.questions.length;
    const answered = this.responsesFormArray.controls.filter(control => {
      const value = control.get('value')?.value;
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return value !== null && value !== '' && value !== undefined;
    }).length;
    return Math.round((answered / total) * 100);
  }

  nextQuestion() {
    if (this.currentQuestionIndex < this.responsesFormArray.length - 1) {
      this.currentQuestionIndex++;
      this.currentQuestion = this.getQuestion(this.currentQuestionIndex);
      console.log('Question suivante:', this.currentQuestionIndex);
      console.log('Question:', this.currentQuestion);
      console.log('FormGroup:', this.getQuestionFormGroup(this.currentQuestionIndex));
    }
  }

  previousQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.currentQuestion = this.getQuestion(this.currentQuestionIndex);
    }
  }

  goToQuestion(index: number) {
    if (index >= 0 && index < this.responsesFormArray.length) {
      this.currentQuestionIndex = index;
      this.currentQuestion = this.getQuestion(index);
      console.log('Navigation vers question', index);
      console.log('Question:', this.currentQuestion);
      console.log('FormGroup:', this.getQuestionFormGroup(index));
    }
  }

  onSubmit() {
    if (this.evaluationForm.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Formulaire incomplet',
        detail: 'Veuillez répondre à toutes les questions obligatoires'
      });
      return;
    }

    if (!this.evaluationId) {
      return;
    }

    this.isSubmitting = true;

    const formValue = this.evaluationForm.value;
    console.log('FormValue avant traitement:', formValue);
    
    const responses: QuestionResponse[] = formValue.responses.map((response: any, index: number) => {
      const questionIndex = this.responsesFormArray.controls.findIndex(c => c.get('questionId')?.value === response.questionId);
      const question = this.getQuestion(questionIndex >= 0 ? questionIndex : index);

      console.log(`Traitement réponse ${index}:`, response, 'Question:', question);

      let value: string | number | string[];
      
      if (question?.type === 'checkbox') {
        // Pour les checkboxes, récupérer les valeurs sélectionnées depuis le FormGroup
        const checkboxValue = response.value;
        console.log('Checkbox value:', checkboxValue);
        if (checkboxValue && typeof checkboxValue === 'object' && !Array.isArray(checkboxValue)) {
          // Parcourir les propriétés du FormGroup pour trouver les options cochées
          const selectedOptions: string[] = [];
          Object.keys(checkboxValue).forEach(key => {
            if (checkboxValue[key] === true && key.startsWith('option_')) {
              const optionIndex = parseInt(key.replace('option_', ''));
              const option = question.options?.[optionIndex];
              if (option) {
                selectedOptions.push(option.text);
              }
            }
          });
          value = selectedOptions;
        } else {
          value = Array.isArray(response.value) 
            ? response.value.filter((v: any) => v !== null && v !== false)
            : [];
        }
      } else if (question?.type === 'rating') {
        value = response.value || 0;
      } else if (question?.type === 'text' || question?.type === 'textarea') {
        value = response.textValue || response.value || '';
      } else {
        value = response.value || '';
      }

      console.log(`Valeur finale pour question ${response.questionId}:`, value);

      return {
        questionId: response.questionId,
        value: value,
        textValue: question?.type === 'text' || question?.type === 'textarea' ? value as string : undefined
      };
    });
    
    console.log('Réponses finales à envoyer:', responses);

    // Récupérer les informations de l'enfant actuel
    const selectedChild = this.childContext.selectedChild();
    const childName = selectedChild ? `${selectedChild.firstName || ''} ${selectedChild.lastName || ''}`.trim() : undefined;
    const classeName = selectedChild?.classe?.name || undefined;

    const evaluationResponse: EvaluationResponse = {
      evaluationId: this.evaluationId,
      childId: selectedChild?.id,
      classeId: selectedChild?.classeId || selectedChild?.classe?.id,
      childName: childName,
      classeName: classeName,
      responses: responses
    };

    this.evaluationService.submitResponse(this.evaluationId, evaluationResponse).subscribe({
      next: () => {
        this.isSubmitted = true;
        this.isSubmitting = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Votre évaluation a été soumise avec succès'
        });
      },
      error: (err) => {
        console.error('=== ERREUR LORS DE LA SOUMISSION ===');
        console.error('Erreur complète:', err);
        console.error('Status:', err.status);
        console.error('Status Text:', err.statusText);
        console.error('URL:', err.url);
        console.error('Error object:', err.error);
        console.error('Error stringified:', JSON.stringify(err, null, 2));
        
        let errorMessage = 'Impossible de soumettre l\'évaluation';
        let errorDetails = '';
        
        if (err.error) {
          // Si err.error est un objet
          if (typeof err.error === 'object') {
            if (err.error.details) {
              console.error('Détails de l\'erreur:', err.error.details);
              errorMessage = err.error.error || err.error.message || errorMessage;
              errorDetails = err.error.details.message || '';
              if (err.error.details.file) {
                errorDetails += '\nFichier: ' + err.error.details.file + ':' + err.error.details.line;
              }
            } else if (err.error.message) {
              errorMessage = err.error.message;
            } else if (err.error.error) {
              errorMessage = err.error.error;
            }
          } else if (typeof err.error === 'string') {
            // Si err.error est une chaîne
            errorMessage = err.error;
          }
        } else if (err.status === 500) {
          errorMessage = 'Erreur serveur (500). Le serveur n\'a pas pu traiter la requête.';
          errorDetails = 'Vérifiez les logs du serveur pour plus de détails.';
        } else if (err.status === 0) {
          errorMessage = 'Impossible de se connecter au serveur.';
          errorDetails = 'Vérifiez votre connexion internet.';
        }
        
        const fullMessage = errorDetails ? `${errorMessage}\n${errorDetails}` : errorMessage;
        
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: fullMessage,
          life: 15000
        });
        this.isSubmitting = false;
      }
    });
  }

  isQuestionAnswered(index: number): boolean {
    const formGroup = this.getQuestionFormGroup(index);
    const value = formGroup.get('value')?.value;
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return value !== null && value !== '' && value !== undefined;
  }

  organizeQuestionsBySection(evaluation: Evaluation) {
    this.questionsBySection = {};
    this.questionsWithoutSection = [];
    
    evaluation.questions.forEach(question => {
      if (question.sectionId) {
        if (!this.questionsBySection[question.sectionId]) {
          this.questionsBySection[question.sectionId] = [];
        }
        this.questionsBySection[question.sectionId].push(question);
      } else {
        this.questionsWithoutSection.push(question);
      }
    });
    
    // Trier les questions dans chaque section
    Object.keys(this.questionsBySection).forEach(sectionId => {
      this.questionsBySection[+sectionId].sort((a, b) => a.order - b.order);
    });
    this.questionsWithoutSection.sort((a, b) => a.order - b.order);
  }

  getSectionById(sectionId: number): EvaluationSection | undefined {
    return this.sections.find(s => s.id === sectionId);
  }

  getAllQuestionsFlat(): EvaluationQuestion[] {
    const allQuestions: EvaluationQuestion[] = [];
    
    // Ajouter les questions par section dans l'ordre des sections
    this.sections.forEach(section => {
      if (this.questionsBySection[section.id!]) {
        allQuestions.push(...this.questionsBySection[section.id!]);
      }
    });
    
    // Ajouter les questions sans section
    allQuestions.push(...this.questionsWithoutSection);
    
    return allQuestions;
  }
}

