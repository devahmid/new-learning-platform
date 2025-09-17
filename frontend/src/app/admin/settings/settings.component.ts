import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
    selector: 'app-settings',
    standalone:true,
    imports: [CommonModule],
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {
  settings = [
    { icon: 'pi pi-user-edit', label: 'Profil', desc: 'Modifier nom, email, mot de passe', path: 'profile' },
    { icon: 'pi pi-moon', label: 'Thème', desc: 'Changer le thème clair/sombre', path: 'theme' },
    { icon: 'pi pi-bell', label: 'Notifications', desc: 'Gérer les emails de rappel', path: 'notifications' },
    { icon: 'pi pi-shield', label: 'Sécurité', desc: 'Activer la double authentification', path: 'security' },
    { icon: 'pi pi-cog', label: 'App', desc: 'Réglages globaux', path: 'app', admin: true },
    { icon: 'pi pi-users', label: 'Rôles', desc: 'Gérer les droits', path: 'roles', admin: true },
  ];
  
  constructor(private router: Router) {}

  goTo(path: string) {
    this.router.navigate(['/admin/settings', path]);
  }
}
