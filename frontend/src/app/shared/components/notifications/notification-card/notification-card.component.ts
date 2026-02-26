import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';
import { Notification } from '../../../models/notification.model';

@Component({
  selector: 'app-notification-card',
  standalone: true,
  imports: [TooltipModule],
  templateUrl: './notification-card.component.html',
  styleUrl: './notification-card.component.scss',
})
export class NotificationCardComponent {
  @Input()
  notification!: Notification;

  @Output()
  btnClick = new EventEmitter();

  constructor(private router: Router) {}

  goToUnitPage() {
    // Navigate to unit page, passing the unit code as a parameter
    this.router.navigate([this.notification.navigateTo]);
  }

  removeNotification() {
    this.btnClick.emit(this.notification);
  }
}
