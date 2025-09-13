import { Component } from '@angular/core';
import { ChatbotComponent } from '../chatbot/chatbot';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-claim-insurance',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, HttpClientModule, ChatbotComponent],
  templateUrl: './claim-insurance.html',
  styleUrls: ['./claim-insurance.css']
})
export class ClaimInsuranceComponent {
  claimForm: FormGroup;

  constructor(private http: HttpClient) {
    this.claimForm = new FormGroup({
      policyNumber: new FormControl('', [Validators.required]),
      policyHolderName: new FormControl('', [Validators.required]),
      contactNumber: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{10}$')]),
      emailAddress: new FormControl('', [Validators.required, Validators.email]),
      descriptionOfDamage: new FormControl('', [Validators.required]),
      dateTimeOfDamage: new FormControl('', [Validators.required]),
      placeOfAccident: new FormControl('', [Validators.required]),
      vehicleNumber: new FormControl('', [Validators.required, Validators.pattern('^[A-Z]{2}[ -][0-9]{1,2}(?: [A-Z])?(?: [A-Z]*)? [0-9]{4}$')]),
      fuelType: new FormControl('', [Validators.required]),
      photoOfDamagedVehicle: new FormControl(null, [Validators.required]),
      drivingLicense: new FormControl(null, [Validators.required])
    });
  }

  onFileChange(event: any, controlName: string) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.claimForm.patchValue({
        [controlName]: file
      });
    }
  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  onSubmit() {
    console.log('Submit button clicked');
    console.log('Form validity:', this.claimForm.valid);
    console.log('Form values:', this.claimForm.value);
    if (this.claimForm.valid) {
      const formData = new FormData();
      Object.keys(this.claimForm.controls).forEach(key => {
        formData.append(key, this.claimForm.get(key)?.value);
      });

      this.http.post('http://localhost:5678/webhook/65582ce6-27e2-403c-85c3-0e256f2972d1', formData).subscribe({
        next: (response) => {
          console.log('Claim submitted successfully!', response);
          alert('Claim submitted successfully!');
          this.claimForm.reset();
        },
        error: (error) => {
          console.error('Error submitting claim:', error);
          alert('Error submitting claim. Please try again.');
        }
      });
    } else {
      this.validateAllFormFields(this.claimForm);
    }
  }


}
