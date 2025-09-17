import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    imports: [CommonModule],
    standalone:true,
    template: `
    <h2 class="text-xl font-semibold mb-4">🔔 Notifications</h2>
    <div class="space-y-4">
      <label class="flex items-center gap-2">
        <input type="checkbox" [checked]="email()" (change)="toggleEmail()" />
        Notifications par email
      </label>

      <label class="flex items-center gap-2">
        <input type="checkbox" [checked]="push()" (change)="togglePush()" />
        Notifications push
      </label>
    </div>
  `
})
export class NotificationsComponent {
  email = signal(true);
  push = signal(false);

  toggleEmail() {
    this.email.update(v => !v);
  }

  togglePush() {
    this.push.update(v => !v);
  }
}
