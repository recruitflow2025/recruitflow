import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { SideMenuComponent } from '../side-menu/side-menu.component';
import { StorageService } from '../common/storage.service'
import { filter, map } from 'rxjs';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { LoaderService } from '../common/loader.service';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet,HeaderComponent,FooterComponent,SideMenuComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit{
  title = 'recruit-flow';
  isLoggedIn: boolean = false; // Set this based on login status
  private loaderService = inject(LoaderService);
  isLoading = false;
  constructor(private storageService: StorageService) {
    this.loaderService.loaderState$.subscribe((isLoading) => {
      this.isLoading = isLoading;
    });
  }

  ngOnInit() {
    // Subscribe to storage changes for the 'isLoggedIn' key
    this.storageService.storageChange$
      .pipe(
        filter((change) => change.key === 'isLoggedIn'), // Only react to 'isLoggedIn' changes
        map((change) => change.value === 'true') // Map the value to a boolean
      )
      .subscribe((isLoggedIn) => {
        this.isLoggedIn = isLoggedIn;
        console.log('isLoggedIn:', this.isLoggedIn);
      });

    // Initialize isLoggedIn status
    this.isLoggedIn = this.storageService.getItem('isLoggedIn') === 'true';
  }
}
