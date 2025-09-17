import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface TableColumn {
  field: string;
  header: string;
  sortable?: boolean;
  width?: string;
  type?: 'text' | 'number' | 'date' | 'status' | 'action';
}

export interface TableRow {
  [key: string]: any;
}

@Component({
  selector: 'app-native-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="native-table-container">
      <!-- En-tête du tableau -->
      <div class="native-table-header bg-gray-50 border-b border-gray-200">
        <div class="flex items-center justify-between p-4">
          <h3 *ngIf="title" class="text-lg font-semibold text-gray-900">
            {{ title }}
          </h3>

          <div class="flex items-center space-x-2">
            <!-- Recherche -->
            <div *ngIf="showSearch" class="relative">
              <input
                type="text"
                [placeholder]="searchPlaceholder"
                [(ngModel)]="searchTerm"
                (input)="onSearch()"
                class="pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <i
                class="fa-solid fa-search absolute left-3 top-3 text-gray-400"
              ></i>
            </div>

            <!-- Boutons d'action -->
            <div *ngIf="showActions" class="flex space-x-2">
              <button
                *ngFor="let action of actions"
                (click)="onActionClick(action)"
                class="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <i *ngIf="action.icon" [class]="action.icon" class="mr-2"></i>
                {{ action.label }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Tableau -->
      <div class="overflow-x-auto">
        <table class="native-table w-full">
          <thead class="bg-gray-50">
            <tr>
              <th
                *ngFor="let col of columns"
                [class]="getHeaderClasses(col)"
                (click)="col.sortable ? onSort(col.field) : null"
                [class.cursor-pointer]="col.sortable"
              >
                <div class="flex items-center justify-between px-4 py-3">
                  <span class="text-sm font-medium text-gray-900">
                    {{ col.header }}
                  </span>

                  <div *ngIf="col.sortable" class="flex flex-col">
                    <i
                      [class]="getSortIcon(col.field, 'asc')"
                      class="text-xs text-gray-400 hover:text-gray-600"
                    ></i>
                    <i
                      [class]="getSortIcon(col.field, 'desc')"
                      class="text-xs text-gray-400 hover:text-gray-600"
                    ></i>
                  </div>
                </div>
              </th>
            </tr>
          </thead>

          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              *ngFor="
                let row of paginatedData;
                trackBy: trackByRow;
                let i = index
              "
              [class]="getRowClasses(i)"
              (click)="onRowClick(row)"
              class="hover:bg-gray-50 cursor-pointer"
            >
              <td
                *ngFor="let col of columns"
                [class]="getCellClasses(col)"
                class="px-4 py-3 text-sm"
              >
                <ng-container [ngSwitch]="col.type">
                  <!-- Texte simple -->
                  <span *ngSwitchDefault [class]="getCellValueClasses(col)">
                    {{ getCellValue(row, col.field) }}
                  </span>

                  <!-- Statut -->
                  <span
                    *ngSwitchCase="'status'"
                    [class]="getStatusClasses(getCellValue(row, col.field))"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  >
                    {{ getCellValue(row, col.field) }}
                  </span>

                  <!-- Date -->
                  <span *ngSwitchCase="'date'" class="text-gray-600">
                    {{ formatDate(getCellValue(row, col.field)) }}
                  </span>

                  <!-- Actions -->
                  <div *ngSwitchCase="'action'" class="flex space-x-2">
                    <button
                      *ngFor="let action of rowActions"
                      (click)="onRowActionClick(action, row, $event)"
                      [class]="getActionButtonClasses(action)"
                      class="px-2 py-1 text-xs font-medium rounded focus:outline-none focus:ring-2"
                    >
                      <i
                        *ngIf="action.icon"
                        [class]="action.icon"
                        class="mr-1"
                      ></i>
                      {{ action.label }}
                    </button>
                  </div>
                </ng-container>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div
        *ngIf="showPagination"
        class="native-table-pagination bg-white border-t border-gray-200 px-4 py-3"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <span class="text-sm text-gray-700">
              Affichage de {{ startIndex + 1 }} à {{ endIndex }} sur
              {{ totalItems }} résultats
            </span>
          </div>

          <div class="flex items-center space-x-2">
            <button
              (click)="previousPage()"
              [disabled]="currentPage === 1"
              class="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Précédent
            </button>

            <span class="text-sm text-gray-700">
              Page {{ currentPage }} sur {{ totalPages }}
            </span>

            <button
              (click)="nextPage()"
              [disabled]="currentPage === totalPages"
              class="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Suivant
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .native-table-container {
        @apply bg-white rounded-lg shadow-sm border border-gray-200;
      }

      .native-table {
        @apply min-w-full divide-y divide-gray-200;
      }

      .native-table th {
        @apply text-left text-xs font-medium text-gray-500 uppercase tracking-wider;
      }

      .native-table td {
        @apply whitespace-nowrap;
      }

      .native-table-pagination {
        @apply flex items-center justify-between;
      }
    `,
  ],
})
export class NativeTableComponent {
  @Input() title = '';
  @Input() columns: TableColumn[] = [];
  @Input() data: TableRow[] = [];
  @Input() showSearch = true;
  @Input() showPagination = true;
  @Input() showActions = true;
  @Input() pageSize = 10;
  @Input() searchPlaceholder = 'Rechercher...';
  @Input() actions: any[] = [];
  @Input() rowActions: any[] = [];

  @Output() rowClick = new EventEmitter<TableRow>();
  @Output() actionClick = new EventEmitter<any>();
  @Output() rowActionClick = new EventEmitter<any>();
  @Output() sortChange = new EventEmitter<{
    field: string;
    direction: 'asc' | 'desc';
  }>();

  searchTerm = '';
  currentPage = 1;
  sortField = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  get filteredData(): TableRow[] {
    if (!this.searchTerm) return this.data;

    return this.data.filter((row) =>
      Object.values(row).some((value) =>
        String(value).toLowerCase().includes(this.searchTerm.toLowerCase())
      )
    );
  }

  get sortedData(): TableRow[] {
    if (!this.sortField) return this.filteredData;

    return [...this.filteredData].sort((a, b) => {
      const aVal = this.getCellValue(a, this.sortField);
      const bVal = this.getCellValue(b, this.sortField);

      if (aVal < bVal) return this.sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  get totalItems(): number {
    return this.sortedData.length;
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  get startIndex(): number {
    return (this.currentPage - 1) * this.pageSize;
  }

  get endIndex(): number {
    return Math.min(this.startIndex + this.pageSize, this.totalItems);
  }

  get paginatedData(): TableRow[] {
    return this.sortedData.slice(this.startIndex, this.endIndex);
  }

  onSearch() {
    this.currentPage = 1;
  }

  onSort(field: string) {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }

    this.sortChange.emit({ field, direction: this.sortDirection });
  }

  onRowClick(row: TableRow) {
    this.rowClick.emit(row);
  }

  onActionClick(action: any) {
    this.actionClick.emit(action);
  }

  onRowActionClick(action: any, row: TableRow, event: Event) {
    event.stopPropagation();
    this.rowActionClick.emit({ action, row });
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  getHeaderClasses(col: TableColumn): string {
    const baseClasses =
      'px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider';
    const sortableClasses = col.sortable
      ? 'cursor-pointer hover:bg-gray-100'
      : '';
    return `${baseClasses} ${sortableClasses}`.trim();
  }

  getRowClasses(index: number): string {
    return index % 2 === 0 ? 'bg-white' : 'bg-gray-50';
  }

  getCellClasses(col: TableColumn): string {
    const baseClasses = 'px-4 py-3 text-sm';
    const widthClasses = col.width ? `w-${col.width}` : '';
    return `${baseClasses} ${widthClasses}`.trim();
  }

  getCellValueClasses(col: TableColumn): string {
    switch (col.type) {
      case 'number':
        return 'text-right font-mono';
      case 'date':
        return 'text-gray-600';
      default:
        return 'text-gray-900';
    }
  }

  getStatusClasses(status: string): string {
    const statusMap: { [key: string]: string } = {
      actif: 'bg-green-100 text-green-800',
      inactif: 'bg-red-100 text-red-800',
      'en attente': 'bg-yellow-100 text-yellow-800',
      terminé: 'bg-blue-100 text-blue-800',
      'en cours': 'bg-purple-100 text-purple-800',
    };

    return statusMap[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  }

  getActionButtonClasses(action: any): string {
    const baseClasses =
      'px-2 py-1 text-xs font-medium rounded focus:outline-none focus:ring-2';

    switch (action.type) {
      case 'danger':
        return `${baseClasses} bg-red-600 text-white hover:bg-red-700 focus:ring-red-500`;
      case 'warning':
        return `${baseClasses} bg-red-600 text-white hover:bg-red-700 focus:ring-red-500`;
      case 'success':
        return `${baseClasses} bg-green-600 text-white hover:bg-green-700 focus:ring-green-500`;
      default:
        return `${baseClasses} bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500`;
    }
  }

  getSortIcon(field: string, direction: 'asc' | 'desc'): string {
    if (this.sortField !== field) return 'fa-solid fa-sort';

    if (this.sortDirection === direction) {
      return direction === 'asc'
        ? 'fa-solid fa-sort-up'
        : 'fa-solid fa-sort-down';
    }

    return 'fa-solid fa-sort';
  }

  getCellValue(row: TableRow, field: string): any {
    return field.split('.').reduce((obj, key) => obj?.[key], row);
  }

  formatDate(date: any): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('fr-FR');
  }

  trackByRow(index: number, row: TableRow): any {
    return row.id || index;
  }
}
