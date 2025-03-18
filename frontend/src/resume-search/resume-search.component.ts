import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-resume-search',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resume-search.component.html',
  styleUrl: './resume-search.component.scss'
})
export class ResumeSearchComponent {
// Dummy data for the table
resumeData = [
  { fileName: 'john_doe_resume.pdf', file: 'john_doe_resume.pdf' },
  { fileName: 'jane_smith_resume.docx', file: 'jane_smith_resume.docx' },
  { fileName: 'alice_johnson_resume.pdf', file: 'alice_johnson_resume.pdf' },
];

// Function to handle file view
viewFile(fileName: string) {
  alert(`Viewing file: ${fileName}`);
}
}
