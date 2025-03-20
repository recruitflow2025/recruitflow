import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { StorageService } from '../common/storage.service'; // Import the service
import { CommonModule } from '@angular/common';
import { AuthService } from '../common/auth.service';
import { LoaderService } from '../common/loader.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule,CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private storageService: StorageService, // Inject the service
    private loaderService: LoaderService
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.loaderService.showLoader();
      const username = this.loginForm.value.username;
      const password = this.loginForm.value.password;
      if (username !== '' && password !== '') {
        this.authService.login(username, password).subscribe(
          response => {           
        this.storageService.setItem('isLoggedIn', 'true'); // Use the service
        this.storageService.setItem('user_id', response.user.user_id); // Use the service
        this.router.navigate(['/add-requirement']);
        this.loaderService.hideLoader();
          },
          error => {
            
        this.loaderService.hideLoader();
            console.error('Login failed', error);
            this.errorMessage = 'Invalid username or password';
            // Handle login error
          }
        );
      } else {
        
        this.loaderService.hideLoader();
        this.errorMessage = 'Invalid username or password';
      }
    } else {
      
      this.loaderService.hideLoader();
      this.errorMessage = 'Please fill out all fields correctly.';
    }
  }
}