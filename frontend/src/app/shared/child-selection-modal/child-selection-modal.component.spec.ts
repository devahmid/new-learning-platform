import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChildSelectionModalComponent } from './child-selection-modal.component';

describe('ChildSelectionModalComponent', () => {
  let component: ChildSelectionModalComponent;
  let fixture: ComponentFixture<ChildSelectionModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChildSelectionModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ChildSelectionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
