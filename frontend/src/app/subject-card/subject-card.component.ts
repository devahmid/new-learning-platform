import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-subject-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './subject-card.component.html',
  styleUrl: './subject-card.component.scss'
})
export class SubjectCardComponent {
  @Input() bg!: string;
  @Input() border!: string;
  @Input() fr!: string;
  @Input() ar!: string;
  @Input() en?: string;
}
