import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SafePipe } from '../pipes/safe.pipe';

const EVALUATION_URL =
  'https://script.google.com/macros/s/AKfycbzz9eKdF0ZX-pGv8pXi4mc6FxmdQBa4LUwIbFhvRDuS_n8TJoRTfeNQbGYaf26AKFSdng/exec';

@Component({
  selector: 'app-evaluation',
  standalone: true,
  imports: [CommonModule, SafePipe],
  templateUrl: './evaluation.component.html',
  styleUrl: './evaluation.component.scss',
})
export class EvaluationComponent {
  readonly evaluationUrl = EVALUATION_URL;
}
