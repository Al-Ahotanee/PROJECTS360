import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, MatButtonModule, MatIconModule, MatSidenavModule, MatTooltipModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private router = inject(Router);
  nav = [
    { label: 'Overview', icon: 'grid_view', link: '/dashboard' },
    { label: 'Project library', icon: 'auto_stories', link: '/catalog' },
    { label: 'Services', icon: 'design_services', link: '/services' },
    { label: 'My orders', icon: 'receipt_long', link: '/orders' },
    { label: 'Ambassador', icon: 'hub', link: '/ambassador' }
  ];
  secondary = [
    { label: 'Profile & settings', icon: 'person_outline', link: '/profile' },
    { label: 'Help centre', icon: 'help_outline', link: '/faq' }
  ];
  logout() { this.router.navigateByUrl('/login'); }
}
