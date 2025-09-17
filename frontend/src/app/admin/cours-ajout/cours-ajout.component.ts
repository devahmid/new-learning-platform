import { Component } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { MessageService } from 'primeng/api';
import { CoursService } from '../../cours/cours.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CheckboxModule } from 'primeng/checkbox';


@Component({
    selector: 'app-cours-ajout',
    standalone:true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        DropdownModule,
        InputTextModule,
        InputTextareaModule,
        ButtonModule,
        FileUploadModule,
        CardModule,
        ToastModule,
        CheckboxModule
    ],
    providers: [MessageService],
    templateUrl: './cours-ajout.component.html',
    styleUrls: ['./cours-ajout.component.scss']
})
export class CoursAjoutComponent {
  coursForm: FormGroup;
  courseForm: FormGroup;
  previewVideoUrl?: SafeResourceUrl;
  previewPdfUrl?: SafeResourceUrl;

  categories = [
    { label: 'Arabe', value: { name: 'ARABE' } },
    { label: 'Religion', value: { name: 'RELIGION' } }
  ];

  niveaux = [
    { label: 'Débutant', value: { name: 'DEBUTANT' } },
    { label: 'Intermédiaire', value: { name: 'INTERMEDIAIRE' } },
    { label: 'Avancé', value: { name: 'AVANCE' } }
  ];

  constructor(
    private fb: FormBuilder,
    private coursService: CoursService,
    private messageService: MessageService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {
    this.coursForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      category: [null, Validators.required],
      level: [null, Validators.required],
      videoUrl: [''],
      pdfUrl: ['']
    });
    this.courseForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      videoUrl: [''],
      pdfUrl: [''],
      levelId: [null, Validators.required],
      categoryId: [null],
      lessons: this.fb.array([]),
      quizzes: this.fb.array([]),
    });
  }

  ajouterCours() {
    if (this.coursForm.valid) {
      this.coursService.ajouterCours(this.coursForm.value).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Cours ajouté avec succès !' });
          this.coursForm.reset();
          setTimeout(() => this.router.navigate(['/cours']), 1000);
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible d’ajouter le cours.' });
        }
      });
    }
  }

  onVideoUpload(event: any) {
    const file = event.files[0];
    const localUrl = URL.createObjectURL(file);
    this.previewVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(localUrl);

    this.coursService.uploadFile(file).subscribe(res => {
      this.coursForm.patchValue({ videoUrl: res.url });
      this.messageService.add({ severity: 'success', summary: 'Vidéo envoyée' });
    });
  }

  get lessons() {
    return this.courseForm.get('lessons') as FormArray;
  }

  get quizzes() {
    return this.courseForm.get('quizzes') as FormArray;
  }

  addLesson() {
    this.lessons.push(this.fb.group({
      title: ['', Validators.required],
      content: [''],
      order: [this.lessons.length + 1],
      videoUrl: [''],
      fileUrl: [''],
    }));
  }

  addQuiz() {
    this.quizzes.push(this.fb.group({
      title: ['', Validators.required],
      questions: this.fb.array([]),
    }));
  }

  addQuestion(quizIndex: number) {
    const questions = (this.quizzes.at(quizIndex).get('questions') as FormArray);
    questions.push(this.fb.group({
      text: ['', Validators.required],
      answers: this.fb.array([
        this.fb.group({ text: [''], isCorrect: [false] }),
        this.fb.group({ text: [''], isCorrect: [false] })
      ])
      
    }));    
  }
  addAnswer(question: AbstractControl) {
    const answers = question.get('answers') as FormArray;
    answers.push(this.fb.group({ text: [''] }));
  }
  
  getQuestionsArray(quiz: AbstractControl): FormArray {
    return quiz.get('questions') as FormArray;
  }
  getAnswersArray(question: AbstractControl | null): FormArray {
    return question?.get('answers') as FormArray;
  }
  

  onPdfUpload(event: any) {
    const file = event.files[0];
    const localUrl = URL.createObjectURL(file);
    this.previewPdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(localUrl);

    this.coursService.uploadFile(file).subscribe(res => {
      this.coursForm.patchValue({ pdfUrl: res.url });
      this.messageService.add({ severity: 'success', summary: 'PDF envoyé' });
    });
  }
  
  uploadFile(event: any, control: any) {
    console.log('>> CONTROL TYPE:', control?.constructor.name, control);

    const file = event.files?.[0];
    if (!file) return;
  
    const formData = new FormData();
    formData.append('files', file); 
  
    this.coursService.uploadFile(formData).subscribe((res: any) => {
      const uploadedUrl = res.url;
      console.log('🧠 res =>', uploadedUrl);
      if (!uploadedUrl) return;
  
      control.setValue(uploadedUrl);
      console.log('🧠 Après setValue =>', control.value);
  
      this.messageService.add({
        severity: 'success',
        summary: 'Fichier envoyé',
        detail: uploadedUrl
      });
  
      console.log('✅ Fichier uploadé :', uploadedUrl);
    });
  }
  
  
  
  submit() {
    console.log('submit ...: ',this.courseForm.value);

    const payload = this.courseForm.value;
    this.coursService.createCourse(payload).subscribe({
      next: (res) => {
        console.log('Course created:', res);
        // show toast, redirect, etc.
      },
      error: (err) => {
        console.error('Erreur:', err);
      }
    });
  }
  
}
