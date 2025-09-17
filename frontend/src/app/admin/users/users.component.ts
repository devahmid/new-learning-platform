import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent {

  // userActions = [
  //   { icon: 'pi pi-users', label: 'Tous les utilisateurs', desc: 'Liste complète des utilisateurs', path: 'list' },
  //   { icon: 'pi pi-user-plus', label: 'Ajouter un utilisateur', desc: 'Créer un nouvel utilisateur', path: 'ajout' },
  //   { icon: 'pi pi-id-card', label: 'Rôles', desc: 'Gérer les rôles', path: 'settings/roles' },
  //   { icon: 'pi pi-building', label: 'Classes', desc: 'Gérer les classes d\'élèves', path: 'classes' },
  // ];

  userActions = [
    {
      icon: 'fa-solid fa-users',
      label: 'Tous les utilisateurs',
      desc: 'Consulter et gérer la liste complète des utilisateurs',
      path: 'list',
    },
    {
      icon: 'fa-solid fa-user-plus',
      label: 'Ajouter un utilisateur',
      desc: 'Créer un nouvel utilisateur (parent ou enfant)',
      path: 'ajout',
    },
    {
      icon: 'fa-solid fa-user-shield',
      label: 'Gestion des rôles',
      desc: 'Configurer les rôles et permissions des utilisateurs',
      path: 'settings/roles',
    },
    {
      icon: 'fa-solid fa-school',
      label: 'Classes d\'élèves',
      desc: 'Organiser les enfants par classes et niveaux',
      path: 'classes',
    },
    {
      icon: 'fa-solid fa-child',
      label: 'Modifier un enfant',
      desc: 'Éditer les informations d\'un enfant spécifique',
      path: 'children/1/edit',
    },
    {
      icon: 'fa-solid fa-user-friends',
      label: 'Modifier un parent',
      desc: 'Éditer les informations d\'un parent spécifique',
      path: 'parents/1/edit',
    },
  ];

  constructor(private router: Router) { }

  goTo(path: string) {
    const basePath = path.startsWith('settings') || path.startsWith('courses') || path.startsWith('stats')
      ? ['/admin', ...path.split('/')]
      : ['/admin/users', ...path.split('/')];

    this.router.navigate(basePath);
  }


}
