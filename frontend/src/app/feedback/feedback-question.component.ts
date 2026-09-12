import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-feedback-question',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './feedback-question.component.html',
  styleUrl: './feedback-question.component.scss',
})
export class FeedbackQuestionComponent {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) description!: string;
  @Input() value: number | null | undefined = null;
  @Input({ required: true }) scale!: number[];
  @Input() required = false;
  @Input({ required: true }) labelFor!: (value: number) => string;

  @Output() rate = new EventEmitter<number>();
}

