import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoursAjoutComponent } from './cours-ajout.component';

describe('CoursAjoutComponent', () => {
  let component: CoursAjoutComponent;
  let fixture: ComponentFixture<CoursAjoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoursAjoutComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CoursAjoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
