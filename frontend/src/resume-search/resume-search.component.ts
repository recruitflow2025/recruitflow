declare var bootstrap: any;
import { Component, ElementRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import mammoth from 'mammoth';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { LoaderService } from '../common/loader.service';

@Component({
  selector: 'app-resume-search',
  standalone: true,
  imports: [FormsModule, CommonModule,NgxExtendedPdfViewerModule],
  templateUrl: './resume-search.component.html',
  styleUrls: ['./resume-search.component.scss']
})
export class ResumeSearchComponent {
  @ViewChild('resumeModal') resumeModal!: ElementRef;  
  filterKeyword = '';
  foundFiles: string[] = [];  // List of files from the backend
  selectedResumeHtml: string | null = null;
  selectedResumeUrl: any;
  isFiltered = false;
  keyword: string = '';
  pagination = {
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  };

  private lbaseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient, private sanitizer: DomSanitizer,private loaderService: LoaderService) {}

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

  // API call for file search with pagination
  searchFiles(keywords: string, page: number = 1, pageSize: number = 10): Observable<any> {
    return this.http.post<any>(`${this.lbaseUrl}/search-files`, { keywords, page, pageSize });
  }

  onSearch(): void {
    if (this.keyword.trim()) {
      this.loaderService.showLoader();
      this.searchFiles(this.keyword, this.pagination.page, this.pagination.pageSize).subscribe(
        (response) => {
          this.foundFiles = response.data;
          this.pagination.total = response.pagination.total;
          this.pagination.totalPages = response.pagination.totalPages;
          this.isFiltered = !!this.keyword;
          this.loaderService.hideLoader();
        },
        (error) => {          
          this.loaderService.hideLoader();
          console.error('Error during search:', error);
        }
      );
    }
  }

  // Method to handle pagination changes
  onPageChange(page: number): void {
    if (page >= 1 && page <= this.pagination.totalPages) {
      this.pagination.page = page;
      this.onSearch(); // Fetch files for the new page
    }
  }

  getSafeUrl(url: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
