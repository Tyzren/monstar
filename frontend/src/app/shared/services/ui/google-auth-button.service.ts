import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GoogleAuthButtonService {

  private _isLoaded = new BehaviorSubject<boolean>(false);
  isLoaded$: Observable<boolean> = this._isLoaded.asObservable();

  constructor() {
    this.loadScript();
  }

  private loadScript() {
    if (typeof google != 'undefined' && google.accounts) {
      this._isLoaded.next(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true;
    script.defer = true;

    script.onload = () => {
      this._isLoaded.next(true)
    }

    script.onerror = () => { 
      console.error('Could not load google script for sign in button');
    }

    document.head.appendChild(script);
  }
}
