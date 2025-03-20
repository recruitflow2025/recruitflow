import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  private loaderSubject = new Subject<boolean>();  // This Subject will broadcast loader state
  loaderState$ = this.loaderSubject.asObservable(); // Observable for other components to subscribe to

  constructor() { }

  showLoader() {
    this.loaderSubject.next(true);  // Emit true to show the loader
  }

  hideLoader() {
    this.loaderSubject.next(false); // Emit false to hide the loader
  }
}
