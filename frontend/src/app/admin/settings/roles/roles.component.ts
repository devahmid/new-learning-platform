import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from '../../../models/user.model';
import { UserService } from '../../../services/user.service';
import { AdminUserService } from '../../../services/admin-user.service';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './roles.component.html',
})
export class RolesComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  roles = [
    { value: 'admin', label: 'Administrateur', color: 'bg-red-100 text-red-800' },
    { value: 'user', label: 'Utilisateur', color: 'bg-blue-100 text-blue-800' },
    { value: 'modérateur', label: 'Modérateur', color: 'bg-green-100 text-green-800' }
  ];
  
  searchTerm = '';
  selectedRole = '';
  isLoading = false;
  showRoleDropdown: { [key: number]: boolean } = {};

  constructor(
    private userService: UserService,
    private adminUserService: AdminUserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userService.findAll().subscribe(users => {
      this.users = users.filter(user => user.type === 'parent');
      this.filteredUsers = [...this.users];
      this.isLoading = false;
    });
  }

  filterUsers(): void {
    this.filteredUsers = this.users.filter(user => {
      const matchesSearch = !this.searchTerm || 
        `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (user.email && user.email.toLowerCase().includes(this.searchTerm.toLowerCase()));
      
      const matchesRole = !this.selectedRole || user.role === this.selectedRole;
      
      return matchesSearch && matchesRole;
    });
  }

  onSearchChange(): void {
    this.filterUsers();
  }

  onRoleFilterChange(): void {
    this.filterUsers();
  }

  toggleRoleDropdown(userId: number): void {
    this.showRoleDropdown[userId] = !this.showRoleDropdown[userId];
  }

  changeRole(user: User, newRole: string): void {
    this.adminUserService.patchUpdateUser(user.id, { role: newRole }).subscribe(() => {
      user.role = newRole;
      this.showRoleDropdown[user.id] = false;
      this.filterUsers(); // Re-filter in case role filter is active
    });
  }

  getRoleInfo(roleValue: string) {
    return this.roles.find(role => role.value === roleValue) || this.roles[1];
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedRole = '';
    this.filterUsers();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    // Fermer tous les dropdowns si on clique ailleurs
    const target = event.target as HTMLElement;
    if (!target.closest('.role-dropdown-container')) {
      this.showRoleDropdown = {};
    }
  }

  goBack(): void {
    this.router.navigate(['/admin/users']);
  }
}
