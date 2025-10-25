import { Component, inject } from '@angular/core';
import { ParentService } from './parent.service';
import { ChildContextService } from './child-context.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-child-switcher',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './child-switcher.component.html',
  styleUrl: './child-switcher.component.scss'
})
export class ChildSwitcherComponent {
  private childContext = inject(ChildContextService);

  selectedChild = this.childContext.selectedChild; // ✅ Signal

  switchChild(child: any) {
    this.childContext.setSelectedChild(child);
  }
  parentService = inject(ParentService);
  //childContext = inject(ChildContextService);
  router = inject(Router);

  enfants: any[] = [];

  ngOnInit(): void {
    this.parentService.getChildrenOfLoggedInParent().subscribe(children => {
      this.enfants = children;
    });
  }

  selectChild(child: any) {
    this.childContext.setSelectedChild(child);
    this.router.navigate(['/matières']);
  }

  // get selectedChild() {
  //   return this.childContext.getSelectedChild();
  // }
}
