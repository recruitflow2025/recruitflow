import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchRequirementComponent } from './search-requirement.component';

describe('SearchRequirementComponent', () => {
  let component: SearchRequirementComponent;
  let fixture: ComponentFixture<SearchRequirementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchRequirementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SearchRequirementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
