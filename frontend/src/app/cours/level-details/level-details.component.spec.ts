import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LevelDetailsComponent } from './level-details.component';

describe('LevelDetailsComponent', () => {
  let component: LevelDetailsComponent;
  let fixture: ComponentFixture<LevelDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LevelDetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LevelDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
