declare var bootstrap: any;
import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, ViewChild, AfterViewInit, Renderer2 } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SubmissionService } from '../search-requirement/submission.service';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import * as mammoth from 'mammoth';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { LoaderService } from '../common/loader.service';

@Component({
  selector: 'app-skill-set-search',
  standalone: true,
  imports: [FormsModule, CommonModule, NgxExtendedPdfViewerModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './skill-set-search.component.html',
  styleUrl: './skill-set-search.component.scss'
})
export class SkillSetSearchComponent implements AfterViewInit {
  @ViewChild('resumeModal') resumeModal!: ElementRef;   
  private lbaseUrl = 'http://localhost:3000';
  filterKeyword = '';
  submissions: any[] = [];
  selectedResumeHtml: string | null = null;
  selectedResumeUrl: any;
  isFiltered = false;
  private modalInstance: any;
  
  pagination = {
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  };

  constructor(
    private submissionService: SubmissionService,
    private sanitizer: DomSanitizer,
    private loaderService: LoaderService,
    private renderer: Renderer2
  ) {
    this.fetchSubmissions(); // Fetch all records by default
  }

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

  // Fetch submissions with optional filter and pagination
  fetchSubmissions() {
    this.loaderService.showLoader();
    this.submissionService
      .getSubmissions(this.filterKeyword, this.pagination.page, this.pagination.pageSize)
      .subscribe(
        (response) => {
          this.submissions = response.data;
          this.pagination.total = response.pagination.total;
          this.pagination.totalPages = response.pagination.totalPages;
          this.pagination.page = response.pagination.page;
          this.pagination.pageSize = response.pagination.pageSize;
          this.isFiltered = !!this.filterKeyword;
          this.loaderService.hideLoader();
        },
        (error) => {
          this.loaderService.hideLoader();
          console.error('Error fetching submissions:', error);
          this.submissions = [];
          this.isFiltered = true;
        }
      );
  }

  // Handle filter submission
  onFilter() {
    this.pagination.page = 1; // Reset to first page when filtering
    this.fetchSubmissions();
  }

  getSafeUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  // Handle pagination
  onPageChange(page: number) {
    if (page >= 1 && page <= this.pagination.totalPages) {
      this.pagination.page = page;
      this.fetchSubmissions();
    }
  }

  // Convenience methods for pagination
  onNextPage() {
    this.onPageChange(this.pagination.page + 1);
  }

  onPreviousPage() {
    this.onPageChange(this.pagination.page - 1);
  }

  async viewResume(resumePath: string) {
    if (resumePath) {
      const fileUrl = `http://localhost:3000/${resumePath}`;

      if (resumePath.endsWith('.pdf')) {
        this.selectedResumeUrl = fileUrl.replace(/\\/g, '/');
        this.selectedResumeHtml = null; // Clear DOCX content
        this.openModal();
      } else if (resumePath.endsWith('.docx')) {
        this.selectedResumeUrl = null; // Clear PDF content
        try {
          const response = await fetch(fileUrl);
          const arrayBuffer = await response.arrayBuffer();
          const result = await mammoth.convertToHtml({ arrayBuffer });
          this.selectedResumeHtml = result.value; // Render DOCX as HTML
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

  getFileUrl(filePath: string): string {
    return `${this.lbaseUrl}/${filePath}`;
  }
}

