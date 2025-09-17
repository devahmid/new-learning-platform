import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-confetti',
  standalone: true,
  template: `<canvas #confettiCanvas class="fixed inset-0 pointer-events-none z-50"></canvas>`,
  styles: [`
    canvas {
      position: fixed;
      top: 0;
      left: 0;
      width: 100% !important;
      height: 100% !important;
      pointer-events: none;
      z-index: 9999;
    }
  `]
})
export class ConfettiComponent implements OnInit {
  @ViewChild('confettiCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  ngOnInit() {
    this.launchConfetti();
  }

  launchConfetti() {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d')!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pieces = Array.from({ length: 150 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      radius: Math.random() * 6 + 4,
      color: `hsl(${Math.random() * 360}, 100%, 50%)`,
      speed: Math.random() * 3 + 2,
      drift: Math.random() * 2 - 1
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of pieces) {
        p.y += p.speed;
        p.x += p.drift;
        if (p.y > canvas.height) {
          p.y = -10;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      }
      requestAnimationFrame(draw);
    };

    draw();

    setTimeout(() => canvas.remove(), 4000);
  }
}
