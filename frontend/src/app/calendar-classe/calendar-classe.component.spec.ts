import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarClasseComponent } from './calendar-classe.component';

describe('CalendarClasseComponent', () => {
  let component: CalendarClasseComponent;
  let fixture: ComponentFixture<CalendarClasseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarClasseComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CalendarClasseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
