import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { StorageService } from './storage.service';

export const authGuard: CanActivateFn = (route, state) => {
  const storageService = inject(StorageService);
  const router = inject(Router);
  
  const isLoggedIn = storageService.getItem('isLoggedIn') === 'true';
  
  if (isLoggedIn) {
    return true;
  }
  
  // Redirect to login page if not logged in
  router.navigate(['/login']);
  return false;
};

export const loginGuard: CanActivateFn = (route, state) => {
  const storageService = inject(StorageService);
  const router = inject(Router);
  
  const isLoggedIn = storageService.getItem('isLoggedIn') === 'true';
  
  if (!isLoggedIn) {
    return true;
  }
  
  // Redirect to main page if already logged in
  router.navigate(['/add-requirement']);
  return false;
}; 