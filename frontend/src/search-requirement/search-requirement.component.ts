import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-search-requirement',
  standalone: true,
  imports: [RouterModule,RouterLink, RouterLinkActive, RouterOutlet,CommonModule],
  templateUrl: './search-requirement.component.html',
  styleUrl: './search-requirement.component.scss'
})
export class SearchRequirementComponent {

}
