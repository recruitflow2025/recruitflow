import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { LoaderService } from '../../common/loader.service';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="auth-container">
      <router-outlet></router-outlet>
      <div *ngIf="isLoading" class="loader-overlay">
        <div class="loader"></div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      width: 100%;
      position: relative;
      margin: 0;
      padding: 0;
      overflow: hidden;
    }
    
    .loader-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    }
    
    .loader {
      border: 16px solid #f3f3f3;
      border-top: 16px solid var(--primary);
      border-radius: 50%;
      width: 50px;
      height: 50px;
      animation: spin 2s linear infinite;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class AuthLayoutComponent {
  private loaderService = inject(LoaderService);
  isLoading = false;
  
  constructor() {
    this.loaderService.loaderState$.subscribe((isLoading) => {
      this.isLoading = isLoading;
    });
  }
} 