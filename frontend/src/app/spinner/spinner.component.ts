import { NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-spinner',
    standalone:true,
    imports: [NgIf],
    template: `<div *ngIf="loading" class="fixed inset-0 flex items-center justify-center bg-white bg-opacity-70 z-50">
    <img src="assets/book.webm" class="w-24 h-24 animate-spin" alt="Chargement..."/>
  </div>`,
    styleUrl: './spinner.component.scss'
})
export class SpinnerComponent {
  @Input() loading = false;
}
