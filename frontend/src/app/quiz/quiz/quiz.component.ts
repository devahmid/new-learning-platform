import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import gsap from 'gsap';

@Component({
    selector: 'app-quiz',
    standalone:true,
    imports: [],
    templateUrl: './quiz.component.html',
    styleUrl: './quiz.component.scss'
})
export class QuizComponent implements AfterViewInit {
  @ViewChild('letterPath', { static: true }) letterPath!: ElementRef;

  ngAfterViewInit() {
    // Masquer complètement la lettre dès le départ
    const path = this.letterPath.nativeElement;
    const length = path.getTotalLength();

    gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
  }

  animate() {
    const path = this.letterPath.nativeElement;
    const length = path.getTotalLength();

    gsap.fromTo(path, 
      { strokeDashoffset: length }, 
      { strokeDashoffset: 0, duration: 3, ease: "power2.out" }
    );
  }
}
