import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LogoutButtonComponent } from '../logout-button/logout-button.component';
import { State } from '../user-profile.state';

@Component({
  selector: 'app-profile-panel',
  standalone: true,
  imports: [LogoutButtonComponent],
  templateUrl: './profile-panel.component.html',
  styleUrl: './profile-panel.component.scss',
})
export class ProfilePanelComponent {
  @Input({ required: true }) state!: State;
  @Output() logoutPressed = new EventEmitter<void>();
}
