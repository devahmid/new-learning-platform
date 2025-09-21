import { Component, OnInit, inject } from '@angular/core';
import { FooterComponent } from '../footer/footer.component';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { ChildContextService } from '../../../_children-context/_children-context/child-context.service';
import { AuthService } from '../../../auth/auth.service';
import { NotificationComponent } from '../../../shared/notification/notification.component';

@Component({
    selector: 'app-app-layout',
    standalone:true,
    imports: [CommonModule, RouterOutlet, FooterComponent, HeaderComponent, NotificationComponent],
    templateUrl: './app-layout.component.html',
    styleUrl: './app-layout.component.scss'
})
export class AppLayoutComponent implements OnInit {
  private childContext = inject(ChildContextService);
  private auth = inject(AuthService);

  ngOnInit() {
    // Charger les enfants dès que l'utilisateur est connecté
    if (this.auth.isLoggedIn()) {
      this.childContext.loadChildren();
    }
  }
}
