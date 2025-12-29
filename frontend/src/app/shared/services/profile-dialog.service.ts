import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProfileDialogService {
  private openDialogSubject = new BehaviorSubject<boolean>(false);
  public openDialog$: Observable<boolean> =
    this.openDialogSubject.asObservable();

  constructor() {}

  /**
   * Opens the profile dialog
   */
  openDialog(): void {
    this.openDialogSubject.next(true);
  }

  /**
   * Closes the profile dialog
   */
  closeDialog(): void {
    this.openDialogSubject.next(false);
  }
}
