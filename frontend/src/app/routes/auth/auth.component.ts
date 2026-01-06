import { Component } from '@angular/core';
import { AuthGoogleButtonComponent } from './auth-google-button/auth-google-button.component';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [
    AuthGoogleButtonComponent,
  ],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent {

}
