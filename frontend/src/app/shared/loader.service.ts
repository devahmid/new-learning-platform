import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  private _loading = signal(false);
  readonly loading = this._loading.asReadonly();
  constructor() { }

  show() {
    this._loading.set(true);
  }

  hide() {
    this._loading.set(false);
  }
}
