declare var bootstrap: any;
import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SubmissionService } from '../search-requirement/submission.service';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import * as mammoth from 'mammoth';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-skill-set-search',
  standalone: true,
  imports: [FormsModule, CommonModule,NgxExtendedPdfViewerModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './skill-set-search.component.html',
  styleUrl: './skill-set-search.component.scss'
})
export class SkillSetSearchComponent {
  @ViewChild('resumeModal') resumeModal!: ElementRef;
  filterKeyword = '';
  submissions: any[] = [];
  selectedResumeHtml: string | null = null;
  selectedResumeUrl:any;
  isFiltered = false;
  pagination = {
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  };

  constructor(private submissionService: SubmissionService,private sanitizer: DomSanitizer) {
    this.fetchSubmissions(); // Fetch all records by default
  }

  // Fetch submissions with optional filter and pagination
  fetchSubmissions() {
    this.submissionService
      .getSubmissions(this.filterKeyword, this.pagination.page, this.pagination.pageSize)
      .subscribe(
        (response) => {
          this.submissions = response.data;
          this.pagination = response.pagination;
          this.isFiltered = !!this.filterKeyword;
        },
        (error) => {
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

  getSafeUrl(url: string) {
    const safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    return safeUrl as string; // Cast the SafeResourceUrl to string
  }

  // Handle pagination
  onPageChange(page: number) {
    this.pagination.page = page;
    this.fetchSubmissions();
  }

async viewResume(resumePath: string) {
  if (resumePath) {
    const fileUrl = `http://localhost:3000/${resumePath}`;

    // window.open(fileUrl, '_blank');
    if (resumePath.endsWith('.pdf')) {
      this.selectedResumeUrl = fileUrl.replace(/\\/g, '/');
      this.selectedResumeHtml = null; // Clear DOCX content
      const modalElement = this.resumeModal.nativeElement;
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    } else if (resumePath.endsWith('.docx')) {
      this.selectedResumeUrl = null; // Clear PDF content
      const response = await fetch(fileUrl);
      const arrayBuffer = await response.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      this.selectedResumeHtml = result.value; // Render DOCX as HTML
      const modalElement = this.resumeModal.nativeElement;
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  } else {
    alert('No resume file found.');
  }
}
// Method to open the modal
openModal(resumeUrl: string) {
  this.selectedResumeUrl = resumeUrl;

  // Use Bootstrap's JavaScript API to show the modal
  const modalElement = this.resumeModal.nativeElement;
  const modal = new bootstrap.Modal(modalElement);
  modal.show();
}
}

