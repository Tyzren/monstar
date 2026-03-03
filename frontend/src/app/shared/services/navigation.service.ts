import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  constructor(private router: Router) {}

  /**
   * * Resets the scroll position of the main content container
   */
  resetScroll() {
    // Try various scroll targets - one of these should work
    setTimeout(() => {
      // Option 1: Main app content container
      const appRoot = document.querySelector('app-root');
      if (appRoot) appRoot.scrollTop = 0;

      // Option 2: Body and HTML elements
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    }, 100); // Small delay to ensure DOM is ready
  }

  navigateTo(route: string[]) {
    this.router.navigate(route);
    this.resetScroll();
  }
}
