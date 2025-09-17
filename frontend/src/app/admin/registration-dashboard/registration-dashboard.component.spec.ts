import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrationDashboardComponent } from './registration-dashboard.component';

describe('RegistrationDashboardComponent', () => {
  let component: RegistrationDashboardComponent;
  let fixture: ComponentFixture<RegistrationDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrationDashboardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RegistrationDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
