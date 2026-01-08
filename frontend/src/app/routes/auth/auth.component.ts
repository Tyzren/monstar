import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '@services/api/user.service';
import { MessageService } from 'primeng/api';
import { AuthGoogleButtonComponent } from './auth-google-button/auth-google-button.component';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [AuthGoogleButtonComponent],
  providers: [MessageService],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss',
})
export class AuthComponent {
  private userService = inject(UserService);
  private messageService = inject(MessageService);

  private router = inject(Router);

  onGoogleCredential(idToken: string) {
    this.userService.googleAuthenticate(idToken).subscribe({
      next: () => this.router.navigate(['/list']),
      error: () =>
        this.messageService.add({
          severity: 'error',
          summary: 'Error signing in',
          detail: 'It did not work for some reason lol :()',
        }),
    });
  }
}
