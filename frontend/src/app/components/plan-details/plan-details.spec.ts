import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanDetails } from './plan-details';

describe('PlanDetails', () => {
  let component: PlanDetails;
  let fixture: ComponentFixture<PlanDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
