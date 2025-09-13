import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimInsuranceComponent } from './claim-insurance';

describe('ClaimInsurance', () => {
  let component: ClaimInsuranceComponent;
  let fixture: ComponentFixture<ClaimInsuranceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClaimInsuranceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClaimInsuranceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
