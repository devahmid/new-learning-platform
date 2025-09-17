import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoursDetailComponent } from './cours-detail.component';

describe('CoursDetailComponent', () => {
  let component: CoursDetailComponent;
  let fixture: ComponentFixture<CoursDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoursDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CoursDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
