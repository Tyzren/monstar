import { AsyncPipe } from '@angular/common';
import {
  Component,
  HostListener,
  inject,
  OnInit,
  ViewChild
} from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { UserService } from '@services/api/user.service';
import { IUser } from 'app/shared/models/v2/user.schema';
import { MessageService } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { RippleModule } from 'primeng/ripple';
import { Sidebar, SidebarModule } from 'primeng/sidebar';
import { StyleClassModule } from 'primeng/styleclass';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { NavigationService } from '../../services/navigation.service';
import { ViewportService, ViewportType } from '../../services/viewport.service';
import { NotificationsPopupComponent } from '../notifications/notifications-popup/notifications-popup.component';

export interface State {
  isAuthenticated: boolean,
  user: IUser | null,
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterLink,
    SidebarModule,
    ButtonModule,
    RippleModule,
    StyleClassModule,
    AvatarModule,
    DialogModule,
    ToastModule,
    TooltipModule,
    BadgeModule,
    NotificationsPopupComponent,
    AsyncPipe,
  ],
  providers: [MessageService],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnInit {
  @ViewChild('sidebarRef') sidebarRef!: Sidebar;
  sidebarVisible: boolean = false;

  username: string | undefined = '';

  // The color of the navbar background (changes based on route)
  navbarColor: string = 'var(--primary-color)';
  // The color of the title (changes based on route)
  titleColor: string = 'var(--primary-color)';
  // The color of the hamburger menu icon (changes based on route)
  hamburgColor: string = 'black';
  // The color of the profile icon (changes based on route)
  profileColor: string = 'black';

  viewportType: ViewportType = 'desktop';

  private messageService = inject(MessageService);
  private userService = inject(UserService);
  private viewportService = inject(ViewportService);
  private navigationService = inject(NavigationService);
  private router = inject(Router);

  state$: Observable<State> = this.userService.currentUser$.pipe(
    map((user: IUser | null) => {
      const state: State = {
        isAuthenticated: false,
        user: null,
      }
      if (!user) return state;
      
      state.isAuthenticated = user ? true : false;
      state.user = user;
      return state;
    })
  )

  constructor() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateNavbarColor();
      });
  }

  ngOnInit(): void {
    this.updateNavbarColor();

    this.viewportService.viewport$.subscribe((type) => {
      this.viewportType = type;
    });
  }

  /**
   * Updates the navbar color based n the current route
   */
  private updateNavbarColor(): void {
    this.navbarColor =
      this.router.url === '/' ? 'var(--primary-color)' : 'var(--fg-dark-color)';
    this.titleColor =
      this.router.url === '/' ? 'black' : 'var(--primary-color)';
    this.hamburgColor = this.router.url === '/' ? 'black' : 'white';
    this.profileColor = this.router.url === '/' ? 'black' : 'white';
  }

  clickedProfileIcon() {
    const user = this.userService.currentUserValue;
    if (!user) { 
      this.router.navigate(['/auth']); 
      return;
    }
    console.log('User is logged in so cant navigate to /auth');
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // If the user presses 's' then we open the sidebar
    if (event.ctrlKey && event.key === 's') {
      event.preventDefault();

      if (!this.sidebarVisible) {
        this.sidebarVisible = true;
      } else {
        this.sidebarVisible = false;
      }
    }
  }

  // Closes the sidebar
  closeSidebar(e: any): void {
    this.sidebarRef.close(e);
  }

  /**
   * * Method to create a toast
   *
   * This method creates a toast with the provided event data.
   *
   * @param event The event data for the toast
   * @event messageService The message service will display the toast.
   */
  handleToastEvent(event: {
    severity: string;
    summary: string;
    detail: string;
  }) {
    this.messageService.add({
      severity: event.severity,
      summary: event.summary,
      detail: event.detail,
    });
  }

  /**
   * * Navigates to a page (but scrolls to top)
   */
  navigateTo(route: string) {
    this.navigationService.navigateTo([route]);
  }
}
