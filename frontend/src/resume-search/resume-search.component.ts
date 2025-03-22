declare var bootstrap: any;
// import { Component, ElementRef, ViewChild } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { DomSanitizer } from '@angular/platform-browser';
// import mammoth from 'mammoth';
// import { catchError, Observable, tap, throwError } from 'rxjs';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
// import { LoaderService } from '../common/loader.service';

// @Component({
//   selector: 'app-resume-search',
//   standalone: true,
//   imports: [FormsModule, CommonModule,NgxExtendedPdfViewerModule],
//   templateUrl: './resume-search.component.html',
//   styleUrls: ['./resume-search.component.scss']
// })
// export class ResumeSearchComponent {
//   @ViewChild('resumeModal') resumeModal!: ElementRef;  
//   private lbaseUrl = 'http://localhost:3000';
//   filterKeyword = '';
//   foundFiles: string[] = [];  // List of files from the backend
//   selectedResumeHtml: string | null = null;
//   selectedResumeUrl: any;
//   isFiltered = false;
//   keyword: string = '';
//   allResults: string[] = [];  // To cache all search results
//   pagination = {
//     page: 1,
//     pageSize: 10,
//     total: 0,
//     totalPages: 0,
//   };
//   loading = false;

//   constructor(private http: HttpClient, private loaderService: LoaderService,private sanitizer: DomSanitizer) {}

//   ngOnInit(): void {}

//   searchFiles(keywords: string, page: number = 1, pageSize: number = 10): Observable<any> {
//     // Show loader before making the HTTP request
//     this.loaderService.showLoader();
  
//     // Make the HTTP request
//     return this.http.post<any>(`${this.lbaseUrl}/search-files`, { keywords, page, pageSize }).pipe(
//       // Add a tap operator to hide the loader once the response is successful
//       tap((response) => {
//         // Hide loader after receiving the response
//         this.loaderService.hideLoader();
//       }),
//       // Catch any errors, hide loader, and rethrow the error for further handling
//       catchError((error) => {
//         this.loaderService.hideLoader(); // Hide loader in case of error
//         return throwError(error); // Rethrow the error
//       })
//     );
//   }
  

//   // Handle search operation
//   onSearch(): void {
//     if (this.keyword.trim()) {
//       // this.loaderService.showLoader();
//       this.loading = true;

//       // Clear previous results
//       this.allResults = [];

//       // Reset pagination for new search
//       this.pagination.page = 1;

//       // Start searching for the first 10 results
//       this.searchFiles(this.keyword, this.pagination.page, this.pagination.pageSize).subscribe(
//         (response) => {
//           this.foundFiles = response.data;
//           this.pagination.total = response.pagination.total;
//           this.pagination.totalPages = response.pagination.totalPages;
//           this.isFiltered = !!this.keyword;

//           this.allResults = this.allResults.concat(response.data);
//           this.loading = false;
//         },
//         (error) => {
//           this.loading = false;
//           console.error('Error during search:', error);
//         }
//       );
//     }
//   }

//   // Handle pagination for the next page
//   onNextPage(): void {
//     if (this.pagination.page < this.pagination.totalPages) {
//       this.pagination.page++;

//       // Check if the next set of results is already in cache
//       if (this.allResults.length >= this.pagination.page * this.pagination.pageSize) {
//         // Simply display the next chunk from the cache
//         this.foundFiles = this.allResults.slice(
//           (this.pagination.page - 1) * this.pagination.pageSize,
//           this.pagination.page * this.pagination.pageSize
//         );
//       } else {
//         // Fetch the next set of 10 files from the backend
//         this.searchFiles(this.keyword, this.pagination.page, this.pagination.pageSize).subscribe(
//           (response) => {
//             this.foundFiles = response.data;
//             // Cache the results
//             this.allResults = this.allResults.concat(response.data);
//           },
//           (error) => console.error('Error fetching next page:', error)
//         );
//       }
//     }
//   }

//   // Handle pagination for the previous page
//   onPreviousPage(): void {
//     if (this.pagination.page > 1) {
//       this.pagination.page--;

//       // Display the previous chunk from the cache
//       this.foundFiles = this.allResults.slice(
//         (this.pagination.page - 1) * this.pagination.pageSize,
//         this.pagination.page * this.pagination.pageSize
//       );
//     }
//   }

  
//   async viewResume(resumePath: string) {
//     if (resumePath) {
//       const fileUrl = `${this.lbaseUrl}/${resumePath}`;

//       if (resumePath.endsWith('.pdf')) {
//         this.selectedResumeUrl = fileUrl;
//         this.selectedResumeHtml = null;
//         const modalElement = this.resumeModal.nativeElement;
//         const modal = new bootstrap.Modal(modalElement);
//         modal.show();
//       } else if (resumePath.endsWith('.docx')) {
//         this.selectedResumeUrl = null;
//         const response = await fetch(fileUrl);
//         const arrayBuffer = await response.arrayBuffer();
//         const result = await mammoth.convertToHtml({ arrayBuffer });
//         this.selectedResumeHtml = result.value;
//         const modalElement = this.resumeModal.nativeElement;
//         const modal = new bootstrap.Modal(modalElement);
//         modal.show();
//       }
//     } else {
//       alert('No resume file found.');
//     }
//   }

//   getSafeUrl(url: string) {
//     return this.sanitizer.bypassSecurityTrustResourceUrl(url);
//   }

//   getFileUrl(filePath: string): string {
//     return `${this.lbaseUrl}/${filePath}`;
//   }
// }


import { Component, ElementRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import mammoth from 'mammoth';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { LoaderService } from '../common/loader.service';

@Component({
  selector: 'app-resume-search',
  standalone: true,
  imports: [FormsModule, CommonModule, NgxExtendedPdfViewerModule],
  templateUrl: './resume-search.component.html',
  styleUrls: ['./resume-search.component.scss']
})
export class ResumeSearchComponent {
  @ViewChild('resumeModal') resumeModal!: ElementRef;
  private lbaseUrl = 'http://localhost:3000';
  filterKeyword = '';
  foundFiles: string[] = [];  // List of files from the backend
  selectedResumeHtml: string | null = null;
  selectedResumeUrl: any;
  isFiltered = false;
  keyword: string = '';
  allResults: string[] = [];  // To cache all search results
  pagination = {
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  };
  loading = false;

  constructor(private http: HttpClient, private loaderService: LoaderService, private sanitizer: DomSanitizer) {}

  ngOnInit(): void {}

  // Function to make API call for search
  searchFiles(keywords: string, page: number = 1, pageSize: number = 10): Observable<any> {
    this.loaderService.showLoader();

    return this.http.post<any>(`${this.lbaseUrl}/search-files`, { keywords, page, pageSize }).pipe(
      tap((response) => {
        this.loaderService.hideLoader();
      }),
      catchError((error) => {
        this.loaderService.hideLoader();
        return throwError(error);
      })
    );
  }

  // Handle search operation
  onSearch(): void {
    if (this.keyword.trim()) {
      this.loading = true;

      // Clear previous results (important when a new search is initiated)
      this.allResults = [];
      this.foundFiles = [];

      // Reset pagination
      this.pagination.page = 1;
      this.pagination.total = 0;
      this.pagination.totalPages = 0;

      // Start searching for the first 10 results
      this.searchFiles(this.keyword, this.pagination.page, this.pagination.pageSize).subscribe(
        (response) => {
          this.foundFiles = response.data;
          this.pagination.total = response.pagination.total;
          this.pagination.totalPages = response.pagination.totalPages;
          this.isFiltered = !!this.keyword;

          // Cache the results for future pagination
          this.allResults = this.allResults.concat(response.data);
          this.loading = false;
        },
        (error) => {
          this.loading = false;
          console.error('Error during search:', error);
        }
      );
    }
  }

  // Handle pagination for the next page
  onNextPage(): void {
    if (this.pagination.page < this.pagination.totalPages) {
      this.pagination.page++;

      // Check if the next set of results is already in cache
      if (this.allResults.length >= this.pagination.page * this.pagination.pageSize) {
        this.foundFiles = this.allResults.slice(
          (this.pagination.page - 1) * this.pagination.pageSize,
          this.pagination.page * this.pagination.pageSize
        );
      } else {
        this.searchFiles(this.keyword, this.pagination.page, this.pagination.pageSize).subscribe(
          (response) => {
            this.foundFiles = response.data;
            this.allResults = this.allResults.concat(response.data);
          },
          (error) => console.error('Error fetching next page:', error)
        );
      }
    }
  }

  // Handle pagination for the previous page
  onPreviousPage(): void {
    if (this.pagination.page > 1) {
      this.pagination.page--;
      this.foundFiles = this.allResults.slice(
        (this.pagination.page - 1) * this.pagination.pageSize,
        this.pagination.page * this.pagination.pageSize
      );
    }
  }

  // Function to view resume when clicked
  async viewResume(resumePath: string) {
    if (resumePath) {
      const fileUrl = `${this.lbaseUrl}/${resumePath}`;

      if (resumePath.endsWith('.pdf')) {
        this.selectedResumeUrl = fileUrl;
        this.selectedResumeHtml = null;
        const modalElement = this.resumeModal.nativeElement;
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
      } else if (resumePath.endsWith('.docx')) {
        this.selectedResumeUrl = null;
        const response = await fetch(fileUrl);
        const arrayBuffer = await response.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        this.selectedResumeHtml = result.value;
        const modalElement = this.resumeModal.nativeElement;
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
      }
    } else {
      alert('No resume file found.');
    }
  }

  // Method to get safe URL for viewing
  getSafeUrl(url: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  // Method to construct file URL
  getFileUrl(filePath: string): string {
    return `${this.lbaseUrl}/${filePath}`;
  }
}
