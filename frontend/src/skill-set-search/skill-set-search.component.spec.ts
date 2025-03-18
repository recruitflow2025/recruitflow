import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkillSetSearchComponent } from './skill-set-search.component';

describe('SkillSetSearchComponent', () => {
  let component: SkillSetSearchComponent;
  let fixture: ComponentFixture<SkillSetSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkillSetSearchComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SkillSetSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
