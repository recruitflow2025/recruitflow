import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResumeSearchComponent } from './resume-search.component';

describe('ResumeSearchComponent', () => {
  let component: ResumeSearchComponent;
  let fixture: ComponentFixture<ResumeSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResumeSearchComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ResumeSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
