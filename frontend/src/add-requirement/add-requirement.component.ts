import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'; // Add ReactiveFormsModule
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common'; // Import CommonModule if needed
import { LoaderService } from '../common/loader.service';

@Component({
  selector: 'app-add-requirement',
  standalone: true, // Ensure standalone is true
  imports: [ReactiveFormsModule, CommonModule], // Add ReactiveFormsModule here
  templateUrl: './add-requirement.component.html',
  styleUrls: ['./add-requirement.component.scss'],
})
export class AddRequirementComponent {
  requirementForm: FormGroup;
  constructor(private fb: FormBuilder, private http: HttpClient,private loaderService: LoaderService) {
    this.requirementForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      middleName: [''],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      description: ['', Validators.required],
      skillSet: ['', Validators.required],
      resume: [null, [Validators.required, this.fileValidator]],
      userId: [1] // Add userId if needed
    });
  }

  // Custom validator for file type
  fileValidator(control: any) {
    const file = control.value;
    if (file) {
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        return { invalidFileType: true };
      }
    }
    return null;
  }

  onSubmit() {
    if (this.requirementForm.valid) {
      this.loaderService.showLoader();
      const formData = new FormData();

      // Append form data
      formData.append('firstName', this.requirementForm.get('firstName')?.value);
      formData.append('lastName', this.requirementForm.get('lastName')?.value);
      formData.append('middleName', this.requirementForm.get('middleName')?.value);
      formData.append('email', this.requirementForm.get('email')?.value);
      formData.append('phone', this.requirementForm.get('phone')?.value);
      formData.append('description', this.requirementForm.get('description')?.value);
      formData.append('skillSet', this.requirementForm.get('skillSet')?.value);
      formData.append('userId', this.requirementForm.get('userId')?.value);

      // Append the file
      const file = this.requirementForm.get('resume')?.value;
      if (file) {
        formData.append('resume', file);
      }

      // Send the data to the backend
      this.http.post('http://localhost:3000/add_submission', formData)
        .subscribe(
          (response) => {
            
      this.loaderService.hideLoader();
            console.log('Data saved successfully', response);
            alert('Data saved successfully');

            // Reset the form after successful submission
            this.requirementForm.reset();

            // Reset the file input manually
            const fileInput = document.getElementById('resume') as HTMLInputElement;
            if (fileInput) {
              fileInput.value = '';
            }
          },
          (error) => {
            
      this.loaderService.hideLoader();
            console.error('Error saving data', error);
            alert('Error saving data');
          }
        );
    }
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.requirementForm.patchValue({ resume: file });
      this.requirementForm.get('resume')?.updateValueAndValidity();
    }
  }
}