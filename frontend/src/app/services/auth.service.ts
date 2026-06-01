import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _isLoggedIn = signal(false);
  isLoggedIn = this._isLoggedIn.asReadonly();

  // Hardcoded seller creds for now — will integrate Firebase Auth
  private SELLER_EMAIL = 'seller@glowmart.pk';
  private SELLER_PASSWORD = 'seller123';

  constructor(private router: Router) {
    const stored = localStorage.getItem('seller_session');
    if (stored === 'active') this._isLoggedIn.set(true);
  }

  login(email: string, password: string): boolean {
    if (email === this.SELLER_EMAIL && password === this.SELLER_PASSWORD) {
      this._isLoggedIn.set(true);
      localStorage.setItem('seller_session', 'active');
      return true;
    }
    return false;
  }

  logout(): void {
    this._isLoggedIn.set(false);
    localStorage.removeItem('seller_session');
    this.router.navigate(['/seller/login']);
  }
}
