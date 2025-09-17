import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FicheEnfantComponent } from './fiche-enfant.component';

describe('FicheEnfantComponent', () => {
  let component: FicheEnfantComponent;
  let fixture: ComponentFixture<FicheEnfantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FicheEnfantComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FicheEnfantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
