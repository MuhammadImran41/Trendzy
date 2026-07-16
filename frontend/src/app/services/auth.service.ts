import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  id:        string;
  name:      string;
  email:     string;
  phone:     string | null;
  role:      'buyer' | 'seller';
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user:  User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http   = inject(HttpClient);
  private router = inject(Router);
  private api    = environment.apiUrl;

  private _user  = signal<User | null>(this._loadUser());
  private _token = signal<string | null>(this._loadToken());

  // Public signals
  user     = this._user.asReadonly();
  token    = this._token.asReadonly();
  isLoggedIn = computed(() => !!this._token());
  isSeller   = computed(() => this._user()?.role === 'seller');
  isBuyer    = computed(() => this._user()?.role === 'buyer');

  // ── Helpers ──────────────────────────────────────────────────────────────

  private _loadUser(): User | null {
    try {
      const u = localStorage.getItem('trendzy_user');
      return u ? JSON.parse(u) : null;
    } catch { return null; }
  }

  private _loadToken(): string | null {
    return localStorage.getItem('trendzy_token');
  }

  private _saveSession(token: string, user: User): void {
    localStorage.setItem('trendzy_token', token);
    localStorage.setItem('trendzy_user', JSON.stringify(user));
    this._token.set(token);
    this._user.set(user);
  }

  private _clearSession(): void {
    localStorage.removeItem('trendzy_token');
    localStorage.removeItem('trendzy_user');
    this._token.set(null);
    this._user.set(null);
  }

  // ── API calls ─────────────────────────────────────────────────────────────

  register(name: string, email: string, password: string, phone?: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.api}/auth/register`, { name, email, password, phone })
      .pipe(tap(res => this._saveSession(res.token, res.user)));
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.api}/auth/login`, { email, password })
      .pipe(tap(res => this._saveSession(res.token, res.user)));
  }

  logout(): void {
    const wasSeller = this.isSeller();
    this._clearSession();
    this.router.navigate(wasSeller ? ['/seller/login'] : ['/login']);
  }

  getToken(): string | null {
    return this._token();
  }
}
