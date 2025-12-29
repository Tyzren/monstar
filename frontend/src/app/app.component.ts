import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// Services
import { ApiService } from './shared/services/api.service';
import { FooterService } from './shared/services/footer.service';

// Components
import { MessageService, PrimeNGConfig } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { FooterComponent } from './shared/components/footer/footer.component';
import { NavbarComponent } from './shared/components/navbar/navbar.component';

// Vercel Analytics
import { inject as injectAnalytics } from '@vercel/analytics';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, ToastModule],
  providers: [ApiService, MessageService],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'], // Fixed the typo from 'styleUrl' to 'styleUrls'
})
export class AppComponent implements OnInit {
  title = 'frontend';
  showFooter: boolean = true;

  constructor(
    private primengConfig: PrimeNGConfig,
    private footerService: FooterService
  ) {
    // Inject Vercel Analytics
    injectAnalytics();
  }

  ngOnInit(): void {
    // Subscribe to footer visibility changes
    this.footerService.showFooter$.subscribe((show) => {
      this.showFooter = show;
    });

    // Enable PrimeNG ripple effect globally
    this.primengConfig.ripple = true;
  }
}
