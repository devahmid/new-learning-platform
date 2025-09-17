import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NiveauUserComponent } from './niveau-user.component';

describe('NiveauUserComponent', () => {
  let component: NiveauUserComponent;
  let fixture: ComponentFixture<NiveauUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NiveauUserComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NiveauUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
