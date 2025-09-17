import { CommonModule, DatePipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';

@Component({
    selector: 'app-fiche-enfant',
    standalone:true,
    templateUrl: './fiche-enfant.component.html',
    imports: [CommonModule, NgForOf, NgClass, NgIf, DatePipe, DialogModule]
})
export class FicheEnfantComponent {
  @Input() visible: boolean = false;
  @Input() child: any;
  @Output() close = new EventEmitter<void>();
  progress = [
    { name: 'Arabe', value: 85 },
    { name: 'Coran', value: 70 },
    { name: 'Quiz', value: 60 }
  ];
  stats = [
    { label: 'Présence', value: '92%' },
    { label: 'Exercices', value: '45' },
    { label: 'Points', value: '320' },
  ];
  

  closeModal() {
    this.close.emit();
  }

  getAge(dateString: string): number {
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }
  
}
