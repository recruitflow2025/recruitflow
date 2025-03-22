import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { StorageService } from '../common/storage.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule,CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  constructor(private router: Router,
      private storageService: StorageService){

  }
  username = 'John Doe'; // Replace with dynamic username from your app
ngOnInit(): void {
  this.checkForLoginRedirect();
}
  // Logout function
  logout() {       
    this.router.navigate(['/login']);
    this.storageService.setItem('isLoggedIn', 'false');
  }

  
  checkForLoginRedirect() {
    const currentUrl = window.location.href;
    // Check if the URL contains the 'login' keyword
    if (currentUrl.includes('login') || window.location.pathname === '/') {
      
    this.logout();
    }
  }
}
