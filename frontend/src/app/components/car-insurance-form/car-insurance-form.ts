import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CarInsuranceService } from '../../services/car-insurance.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-car-insurance-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './car-insurance-form.html',
  styleUrls: ['./car-insurance-form.css']
})
export class CarInsuranceFormComponent implements OnInit {
  carInsuranceForm!: FormGroup;
  isSubmitted: boolean = false;
  submitted: boolean = false;
  hasApplied: boolean = false;
  private planId!: string;
  private userEmail!: string;
  identityProofFile: File | null = null;
  photographFile: File | null = null;
  vehicleRcCopyFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private carInsuranceService: CarInsuranceService,
    private location: Location,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.carInsuranceForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\s]*$/)]],
      dateOfBirth: ['', Validators.required],
      gender: ['', Validators.required],
      address: ['', Validators.required],
      contactNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      vehicleNumber: ['', Validators.required],
      vehicleColour: ['', Validators.required],
      fuelType: ['', Validators.required],
      emailAddress: ['', [Validators.required, Validators.email]]
    });

    this.route.paramMap.subscribe(params => {
      this.planId = params.get('id') || '';
    });
    this.authService.currentUser$.subscribe((user: import("c:/Users/ashis/OneDrive/Documents/Angular/Insurance Claim Agent/frontend/src/app/models/user.model").User | null) => {
      if (user && user.email) {
        this.userEmail = user.email;
        this.carInsuranceForm.get('emailAddress')?.setValue(this.userEmail);
      }
    });
  }

  onFileChange(event: any, controlName: string): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (controlName === 'identityProof') {
      this.identityProofFile = file || null;
    } else if (controlName === 'photograph') {
      this.photographFile = file || null;
    } else if (controlName === 'vehicleRcCopy') {
      this.vehicleRcCopyFile = file || null;
    }
  }

  onSubmit(): void {
    this.submitted = true;

    console.log('Submitting form...');
    if (this.carInsuranceForm.valid && this.identityProofFile && this.photographFile && this.vehicleRcCopyFile) {
      console.log('Form is valid. Data:', this.carInsuranceForm.value);

      const formData = new FormData();

      const formValue = this.carInsuranceForm.getRawValue();
      Object.keys(formValue).forEach(key => {
        if (key !== 'identityProof' && key !== 'photograph' && key !== 'vehicleRcCopy') {
          formData.append(key, formValue[key]);
        }
      });

      if (this.identityProofFile) {
        formData.append('identityProof', this.identityProofFile, this.identityProofFile.name);
      }

      if (this.photographFile) {
        formData.append('photograph', this.photographFile, this.photographFile.name);
      }

      if (this.vehicleRcCopyFile) {
        formData.append('vehicleRcCopy', this.vehicleRcCopyFile, this.vehicleRcCopyFile.name);
      }

      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      this.carInsuranceService.submitApplication(formData).subscribe(
        (response) => {
          console.log('Application submitted successfully', response);
          this.isSubmitted = true;
        },
        (error) => {
          console.error('Error submitting application', error);
        }
      );
    } else {
      console.log('Form is invalid.');
      this.logValidationErrors(this.carInsuranceForm);
      this.markAllAsTouched(this.carInsuranceForm);
    }
  }

  logValidationErrors(group: FormGroup): void {
    Object.keys(group.controls).forEach(key => {
      const control = group.get(key);
      if (control instanceof FormGroup) {
        this.logValidationErrors(control);
      } else {
        const controlErrors = control?.errors;
        if (controlErrors != null) {
          Object.keys(controlErrors).forEach(keyError => {
            console.log('Key control: ' + key + ', keyError: ' + keyError + ', err value: ', controlErrors[keyError]);
          });
        }
      }
    });
  }

  markAllAsTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      if (control instanceof FormGroup) {
        this.markAllAsTouched(control);
      } else {
        control.markAsTouched();
      }
    });
  }

  goBack(): void {
    this.location.back();
  }

  goToHomePage(): void {
    this.router.navigate(['/dashboard']);
  }
}