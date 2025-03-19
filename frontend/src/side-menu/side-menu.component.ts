import { NgClass } from '@angular/common';
import { Component, ElementRef } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-side-menu',
  standalone: true,
  imports: [RouterLink, RouterLinkActive,NgClass],
  templateUrl: './side-menu.component.html',
  styleUrl: './side-menu.component.scss'
})
export class SideMenuComponent {
  constructor(private elementRef: ElementRef) {}

  toggleSidebar() {
    const hostElement = this.elementRef.nativeElement;
    hostElement.classList.toggle('open');
  }
}
