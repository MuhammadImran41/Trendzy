import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-seller-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  styles: [`
    .page {
      min-height: 100vh;
      display: grid;
      grid-template-columns: 1fr 1fr;
      background: #faf7f4;
    }
    @media (max-width: 768px) {
      .page { grid-template-columns: 1fr; }
      .left-panel { display: none; }
    }

    /* ── Left decorative panel ── */
    .left-panel {
      background: #1a1410;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem;
      position: relative;
      overflow: hidden;
    }
    .left-panel::before {
      content: '';
      position: absolute;
      top: -10rem; left: -10rem;
      width: 30rem; height: 30rem;
      background: radial-gradient(circle, rgba(201,169,110,0.12) 0%, transparent 70%);
      pointer-events: none;
    }
    .left-panel::after {
      content: '';
      position: absolute;
      bottom: -8rem; right: -8rem;
      width: 24rem; height: 24rem;
      background: radial-gradient(circle, rgba(232,52,122,0.08) 0%, transparent 70%);
      pointer-events: none;
    }
    .brand-name {
      font-family: 'DM Serif Display', Georgia, serif;
      font-size: 2.5rem;
      font-weight: 400;
      color: #faf7f4;
      letter-spacing: 0.06em;
      margin-bottom: 0.375rem;
      position: relative;
    }
    .brand-sub {
      font-family: 'Inter', sans-serif;
      font-size: 0.65rem;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      color: #c9a96e;
      margin-bottom: 3rem;
      position: relative;
    }
    .left-divider {
      width: 40px; height: 1px;
      background: linear-gradient(90deg, transparent, #c9a96e, transparent);
      margin-bottom: 3rem;
      position: relative;
    }
    .left-features {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      position: relative;
    }
    .feature-row {
      display: flex;
      align-items: center;
      gap: 0.875rem;
    }
    .feature-icon {
      width: 36px; height: 36px;
      border: 1px solid rgba(201,169,110,0.25);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .feature-text {
      font-family: 'Inter', sans-serif;
      font-size: 0.82rem;
      color: #6b6560;
      line-height: 1.4;
    }
    .feature-text strong {
      display: block;
      color: #9e9890;
      font-weight: 500;
    }

    /* ── Right login panel ── */
    .right-panel {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 2rem;
    }
    .login-box {
      width: 100%;
      max-width: 380px;
    }
    .login-header { margin-bottom: 2.5rem; }
    .login-eyebrow {
      font-family: 'Inter', sans-serif;
      font-size: 0.65rem; font-weight: 500;
      letter-spacing: 0.25em; text-transform: uppercase;
      color: #c9a96e; margin-bottom: 0.75rem;
    }
    .login-title {
      font-family: 'DM Serif Display', Georgia, serif;
      font-size: 2rem; font-weight: 400;
      color: #1a1410; line-height: 1.15;
      margin-bottom: 0.375rem;
    }
    .login-sub {
      font-family: 'Inter', sans-serif;
      font-size: 0.82rem; color: #9e9890;
    }

    .field-group { margin-bottom: 1rem; }
    .field-label {
      display: block;
      font-family: 'Inter', sans-serif;
      font-size: 0.65rem; font-weight: 500;
      letter-spacing: 0.15em; text-transform: uppercase;
      color: #6b6560; margin-bottom: 0.5rem;
    }
    .field-wrap {
      position: relative;
    }
    .field-icon {
      position: absolute;
      left: 0.875rem; top: 50%;
      transform: translateY(-50%);
      color: #b0a898;
      pointer-events: none;
    }
    .field-input {
      width: 100%;
      background: #fff;
      border: 1px solid #ddd8d0;
      padding: 0.75rem 0.875rem 0.75rem 2.5rem;
      font-family: 'Inter', sans-serif;
      font-size: 0.875rem;
      color: #1a1410;
      outline: none;
      transition: border-color 0.2s;
    }
    .field-input::placeholder { color: #b0a898; }
    .field-input:focus { border-color: #c9a96e; }

    .error-msg {
      padding: 0.625rem 0.875rem;
      background: rgba(239,68,68,0.06);
      border: 1px solid rgba(239,68,68,0.2);
      font-family: 'Inter', sans-serif;
      font-size: 0.8rem; color: #dc2626;
      margin-bottom: 1rem;
      display: flex; align-items: center; gap: 0.5rem;
    }

    .login-btn {
      width: 100%;
      padding: 0.875rem;
      background: #1a1410;
      color: #faf7f4;
      font-family: 'Inter', sans-serif;
      font-size: 0.78rem; font-weight: 500;
      letter-spacing: 0.15em; text-transform: uppercase;
      border: none; cursor: pointer;
      transition: background 0.2s;
      margin-bottom: 1.5rem;
    }
    .login-btn:hover { background: #2d2520; }

    .demo-box {
      padding: 0.875rem 1rem;
      background: #f5f0e8;
      border: 1px solid #e8e0d6;
    }
    .demo-label {
      font-family: 'Inter', sans-serif;
      font-size: 0.6rem; font-weight: 600;
      letter-spacing: 0.2em; text-transform: uppercase;
      color: #9e9890; margin-bottom: 0.375rem;
    }
    .demo-creds {
      font-family: 'JetBrains Mono', 'Courier New', monospace;
      font-size: 0.78rem; color: #6b6560;
      line-height: 1.6;
    }
    .demo-creds span { color: #c9a96e; }
  `],
  template: `
    <div class="page">

      <!-- Left decorative panel -->
      <div class="left-panel">
        <div class="brand-name">Trendzy</div>
        <div class="brand-sub">Seller Portal</div>
        <div class="left-divider"></div>

        <div class="left-features">
          <div class="feature-row">
            <div class="feature-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c9a96e" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
              </svg>
            </div>
            <div class="feature-text">
              <strong>Order Management</strong>
              Track and update all customer orders
            </div>
          </div>
          <div class="feature-row">
            <div class="feature-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c9a96e" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
            </div>
            <div class="feature-text">
              <strong>Product Catalogue</strong>
              Manage your product listings
            </div>
          </div>
          <div class="feature-row">
            <div class="feature-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c9a96e" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
              </svg>
            </div>
            <div class="feature-text">
              <strong>Oriflame Scraper</strong>
              Import products directly from oriflame.com.pk
            </div>
          </div>
          <div class="feature-row">
            <div class="feature-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c9a96e" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
            </div>
            <div class="feature-text">
              <strong>Email Notifications</strong>
              Instant alerts for every new order
            </div>
          </div>
        </div>
      </div>

      <!-- Right login panel -->
      <div class="right-panel">
        <div class="login-box">

          <div class="login-header">
            <div class="login-eyebrow">Seller Access</div>
            <h1 class="login-title">Seller<br>Login</h1>
            <p class="login-sub">Sign in to manage your store</p>
          </div>

          <div class="field-group">
            <label class="field-label">Email Address</label>
            <div class="field-wrap">
              <span class="field-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
              </span>
              <input type="email" [(ngModel)]="email" placeholder="seller@trendzy.pk"
                class="field-input" (keyup.enter)="login()" />
            </div>
          </div>

          <div class="field-group" style="margin-bottom:1.5rem;">
            <label class="field-label">Password</label>
            <div class="field-wrap">
              <span class="field-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
              </span>
              <input type="password" [(ngModel)]="password" placeholder="••••••••"
                class="field-input" (keyup.enter)="login()" />
            </div>
          </div>

          @if (error()) {
            <div class="error-msg">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {{ error() }}
            </div>
          }

          <button class="login-btn" (click)="login()">
            Sign In to Dashboard
          </button>

        </div>
      </div>

    </div>
  `
})
export class SellerLoginComponent {
  private auth   = inject(AuthService);
  private router = inject(Router);
  email    = '';
  password = '';
  error    = signal('');

  login() {
    if (this.auth.login(this.email, this.password)) {
      this.router.navigate(['/seller/dashboard']);
    } else {
      this.error.set('Invalid email or password.');
    }
  }
}
