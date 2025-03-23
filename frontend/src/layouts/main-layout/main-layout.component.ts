import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../header/header.component';
import { SideMenuComponent } from '../../side-menu/side-menu.component';
import { LoaderService } from '../../common/loader.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, SideMenuComponent],
  template: `
    <div class="main-container">
      <app-header></app-header>
      
      <div class="content-wrapper">
        <app-side-menu></app-side-menu>
        <div class="content-area">
          <router-outlet></router-outlet>
          <div *ngIf="isLoading" class="loader-overlay">
            <div class="loader"></div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .main-container {
      display: flex;
      min-height: 100vh;
      flex-direction: column;
      padding-top: 60px; /* Keep this to account for fixed header */
    }
    
    .content-wrapper {
      display: flex;
      flex: 1;
      position: relative;
    }
    
    .content-area {
      flex: 1;
      margin-left: 250px; /* Match side menu width */
      background-color: var(--gray-100);
      padding: 2px; /* Reduced from 5px to 2px */
      transition: var(--transition);
      min-height: calc(100vh - 60px); /* Account for header height */
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
    
    /* Responsive design */
    @media (max-width: 992px) {
      .content-area {
        margin-left: 0;
        padding: 2px; /* Consistent 2px padding */
      }
    }
    
    @media (max-width: 768px) {
      .main-container {
        padding-top: 50px; /* Adjust for smaller header on mobile */
      }
      
      .content-area {
        padding: 2px; /* Consistent 2px padding */
      }
    }
  `]
})
export class MainLayoutComponent {
  private loaderService = inject(LoaderService);
  isLoading = false;
  
  constructor() {
    this.loaderService.loaderState$.subscribe((isLoading) => {
      this.isLoading = isLoading;
    });
  }
} 