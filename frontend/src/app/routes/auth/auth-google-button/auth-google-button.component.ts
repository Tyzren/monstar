import {
  Component,
  DestroyRef,
  ElementRef,
  EventEmitter,
  inject,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GoogleAuthButtonService } from '@services/ui/google-auth-button.service';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-auth-google-button',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './auth-google-button.component.html',
  styleUrl: './auth-google-button.component.scss',
})
export class AuthGoogleButtonComponent implements OnInit {
  @Output() credentialResponse = new EventEmitter<string>();
  @Output() error = new EventEmitter<string>();

  @ViewChild('hiddenGoogleBtn', { static: true }) hiddenGoogleBtn!: ElementRef;

  private clientId =
    '671526426147-a16p1qi3iq3mtf672f7ka5hlpq8mvl3d.apps.googleusercontent.com';

  private googleAuthButtonService = inject(GoogleAuthButtonService);
  private destroyRef = inject(DestroyRef);

  isLoading = true;
  hasError = false;
  private initialised = false;

  ngOnInit(): void {
    this.googleAuthButtonService.isLoaded$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((loaded) => {
        if (loaded && !this.initialised) this.initialise();
      });
  }

  initialise() {
    try {
      google.accounts.id.initialize({
        client_id: this.clientId,
        callback: this.handleCredentialResponse.bind(this),
        ux_mode: 'popup',
      });

      google.accounts.id.renderButton(this.hiddenGoogleBtn.nativeElement, {
        type: 'icon',
        size: 'large',
      })

      this.initialised = true;
      this.isLoading = false;
    } catch (err) {
      console.error('Failed to initialise the google auth button', err);
      this.hasError = true;
      this.isLoading = true;
      this.error.emit('Failed to intialise google sign in');
    }
  }

  trigger() {
    const googleButton =
      this.hiddenGoogleBtn.nativeElement.querySelector('div[role="button"]') ||
      this.hiddenGoogleBtn.nativeElement.querySelector('iframe');

    if (googleButton) {
      googleButton.click();
    } else {
      console.error('Faild to programmatically click on hidden google button');
    }
  }

  private handleCredentialResponse(
    response: google.accounts.id.CredentialResponse
  ) {
    this.credentialResponse.emit(response.credential);
  }
}
