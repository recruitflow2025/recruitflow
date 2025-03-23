import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { StorageService } from '../common/storage.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  constructor(
    private router: Router,
    private storageService: StorageService
  ) {}
  
  username = 'John Doe'; // Replace with dynamic username from your app
  
  // Logout function
  logout() {       
    this.storageService.setItem('isLoggedIn', 'false');
    this.router.navigate(['/login']);
  }
}
