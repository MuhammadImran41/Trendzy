import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _isLoggedIn = signal(false);
  isLoggedIn = this._isLoggedIn.asReadonly();

  private SELLER_EMAIL = 'seller@trendzy.pk';
  private SELLER_PASSWORD = 'seller123';

  constructor(private router: Router) {}

  login(email: string, password: string): boolean {
    if (email === this.SELLER_EMAIL && password === this.SELLER_PASSWORD) {
      this._isLoggedIn.set(true);
      return true;
    }
    return false;
  }

  logout(): void {
    this._isLoggedIn.set(false);
    this.router.navigate(['/seller/login']);
  }
}
