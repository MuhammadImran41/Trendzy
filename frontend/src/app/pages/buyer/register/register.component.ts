import { Component, inject, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  styles: [`
    .auth-page {
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      background: #faf7f4; padding: 2rem 1rem;
    }
    .auth-card {
      width: 100%; max-width: 440px; background: #fff;
      border: 1px solid #e8e0d6; border-radius: 16px;
      padding: 2.5rem 2rem; box-shadow: 0 8px 40px rgba(26,20,16,0.08);
    }
    .brand { text-align: center; margin-bottom: 2rem; }
    .brand-logo { font-family: 'Playfair Display',serif; font-size: 28px; font-weight: 800; letter-spacing: 5px; }
    .brand-logo .t { color: #1a1410; }
    .brand-logo .z { background: linear-gradient(135deg,#8b6010,#c8920a); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
    .brand-sub { font-family: 'Inter',sans-serif; font-size: 0.75rem; color: #b0a898; letter-spacing: 2px; text-transform: uppercase; margin-top: 4px; }
    h2 { font-family: 'DM Serif Display',serif; font-size: 1.6rem; font-weight: 400; color: #1a1410; margin: 0 0 0.25rem; text-align: center; }
    .sub { font-family: 'Inter',sans-serif; font-size: 0.82rem; color: #9e9890; text-align: center; margin-bottom: 1.75rem; }
    .divider { height: 1px; background: #f0ebe4; margin: 1.5rem 0; }
    .field { margin-bottom: 1.25rem; }
    label { display: block; font-family: 'Inter',sans-serif; font-size: 0.72rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #6b6560; margin-bottom: 6px; }
    input {
      width: 100%; padding: 0.75rem 1rem; border: 1px solid #e8e0d6; border-radius: 8px;
      font-family: 'Inter',sans-serif; font-size: 0.9rem; color: #1a1410;
      background: #faf7f4; outline: none; transition: border-color 0.2s; box-sizing: border-box;
    }
    input:focus { border-color: #c9a96e; background: #fff; }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .btn-primary {
      width: 100%; padding: 0.875rem; background: #1a1410; color: #faf7f4; border: none;
      border-radius: 8px; font-family: 'Inter',sans-serif; font-size: 0.85rem; font-weight: 600;
      letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer; transition: background 0.2s;
    }
    .btn-primary:hover:not(:disabled) { background: #c9a96e; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .error { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; border-radius: 8px; padding: 0.75rem 1rem; font-size: 0.85rem; margin-bottom: 1rem; font-family: 'Inter',sans-serif; }
    .success { background: #f0fdf4; border: 1px solid #86efac; color: #166534; border-radius: 8px; padding: 0.75rem 1rem; font-size: 0.85rem; margin-bottom: 1rem; font-family: 'Inter',sans-serif; }
    .footer-link { text-align: center; font-family: 'Inter',sans-serif; font-size: 0.82rem; color: #9e9890; margin-top: 1.25rem; }
    .footer-link a { color: #c9a96e; text-decoration: none; font-weight: 600; }
    .hint { font-family: 'Inter',sans-serif; font-size: 0.72rem; color: #b0a898; margin-top: 4px; }
  `],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="brand">
          <div class="brand-logo"><span class="t">TREND</span><span class="z">ZY</span></div>
          <div class="brand-sub">Premium Fashion Store</div>
        </div>

        <h2>Create Account</h2>
        <p class="sub">Join Trendzy to track your orders</p>

        @if (error()) {
          <div class="error">{{ error() }}</div>
        }

        <div class="row">
          <div class="field">
            <label>Full Name</label>
            <input type="text" [(ngModel)]="name" placeholder="Ali Hassan" />
          </div>
          <div class="field">
            <label>Phone</label>
            <input type="tel" [(ngModel)]="phone" placeholder="+92 300 1234567" />
          </div>
        </div>

        <div class="field">
          <label>Email Address</label>
          <input type="email" [(ngModel)]="email" placeholder="your@email.com" />
        </div>

        <div class="field">
          <label>Password</label>
          <input type="password" [(ngModel)]="password" placeholder="Min 6 characters" (keyup.enter)="submit()" />
          <div class="hint">At least 6 characters</div>
        </div>

        <button class="btn-primary" (click)="submit()" [disabled]="loading()">
          {{ loading() ? 'Creating account...' : 'Create Account' }}
        </button>

        <div class="divider"></div>

        <div class="footer-link">
          Already have an account? <a routerLink="/login">Sign in</a>
        </div>
        <div class="footer-link" style="margin-top:0.5rem;">
          <a routerLink="/">← Continue shopping</a>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  private auth   = inject(AuthService);
  private router = inject(Router);

  name     = '';
  email    = '';
  password = '';
  phone    = '';
  loading  = signal(false);
  error    = signal('');

  submit() {
    if (!this.name || !this.email || !this.password) {
      this.error.set('Please fill in name, email and password');
      return;
    }
    if (this.password.length < 6) {
      this.error.set('Password must be at least 6 characters');
      return;
    }
    this.loading.set(true);
    this.error.set('');

    this.auth.register(this.name, this.email, this.password, this.phone || undefined).subscribe({
      next: () => {
        this.loading.set(false);
        const redirect = localStorage.getItem('trendzy_redirect') || '/';
        localStorage.removeItem('trendzy_redirect');
        this.router.navigate([redirect]);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.detail || 'Registration failed. Try again.');
      }
    });
  }
}
