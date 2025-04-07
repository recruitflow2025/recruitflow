declare var bootstrap: any;
import { Component, ElementRef, ViewChild, AfterViewInit, Renderer2 } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
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
export class ResumeSearchComponent implements AfterViewInit {
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
  private modalInstance: any;

  constructor(
    private http: HttpClient, 
    private loaderService: LoaderService, 
    private sanitizer: DomSanitizer,
    private renderer: Renderer2
  ) {}

  ngAfterViewInit() {
    // Move modal to body to avoid stacking context issues
    if (this.resumeModal && this.resumeModal.nativeElement) {
      // Only append if not already in body
      if (this.resumeModal.nativeElement.parentElement !== document.body) {
        document.body.appendChild(this.resumeModal.nativeElement);
      }
      
      // Add event listener to close button
      const closeButtons = this.resumeModal.nativeElement.querySelectorAll('[data-bs-dismiss="modal"]');
      closeButtons.forEach((button: HTMLElement) => {
        button.addEventListener('click', () => {
          if (this.modalInstance) {
            this.modalInstance.hide();
          }
        });
      });
    }
  }

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
        this.openModal();
      } else if (resumePath.endsWith('.docx')) {
        this.selectedResumeUrl = null;
        try {
          const response = await fetch(fileUrl);
          const arrayBuffer = await response.arrayBuffer();
          const result = await mammoth.convertToHtml({ arrayBuffer });
          this.selectedResumeHtml = result.value;
          this.openModal();
        } catch (error) {
          console.error('Error converting DOCX:', error);
          alert('Error loading document. Please try again.');
        }
      }
    } else {
      alert('No resume file found.');
    }
  }

  // Method to open the modal
  openModal() {
    // Destroy any existing modal instance
    if (this.modalInstance) {
      this.modalInstance.dispose();
    }
    
    // Create a new modal instance
    const modalElement = this.resumeModal.nativeElement;
    this.modalInstance = new bootstrap.Modal(modalElement, {
      backdrop: true,  // Allow clicking outside to close
      keyboard: true   // Allow ESC key to close
    });
    
    // Add class to body for proper styling
    document.body.classList.add('modal-open');
    
    // Show the modal
    this.modalInstance.show();
    
    // Add event listener for modal hidden event
    modalElement.addEventListener('hidden.bs.modal', () => {
      document.body.classList.remove('modal-open');
    });
  }

  // Method to explicitly close the modal
  closeModal() {
    if (this.modalInstance) {
      this.modalInstance.hide();
    }
  }

  // Method to get safe URL for viewing
  getSafeUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  // Method to construct file URL
  getFileUrl(filePath: string): string {
    return `${this.lbaseUrl}/${filePath}`;
  }
}
