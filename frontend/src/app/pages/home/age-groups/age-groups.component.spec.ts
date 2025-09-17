import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgeGroupsComponent } from './age-groups.component';

describe('AgeGroupsComponent', () => {
  let component: AgeGroupsComponent;
  let fixture: ComponentFixture<AgeGroupsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgeGroupsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AgeGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
