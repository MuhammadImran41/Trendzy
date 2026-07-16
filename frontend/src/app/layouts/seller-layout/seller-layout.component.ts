import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-seller-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  styles: [`
    :host { display: block; }

    .shell {
      min-height: 100vh;
      display: flex;
      background: #faf7f4;
    }

    /* ── Sidebar ── */
    .sidebar {
      width: 240px;
      flex-shrink: 0;
      background: #1a1410;
      display: flex;
      flex-direction: column;
      position: fixed;
      top: 0; bottom: 0; left: 0;
      z-index: 50;
    }

    .sidebar-logo {
      height: 72px;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0 1.5rem;
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    .logo-text-block { display: flex; flex-direction: column; align-items: flex-start; }
    .logo-wordmark-s { font-family: 'Playfair Display', Georgia, serif; font-size: 22px; font-weight: 700; letter-spacing: 4px; line-height: 1; margin-bottom: 2px; }
    .logo-wordmark-s .trend { color: #faf7f4; }
    .logo-wordmark-s .zy { background: linear-gradient(135deg, #8b6010 0%, #c8920a 45%, #7a5008 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .logo-tagline-s { font-family: 'Montserrat', 'Inter', sans-serif; font-size: 5px; font-weight: 600; letter-spacing: 2.5px; color: #c9a96e; text-transform: uppercase; }
    .logo-badge {
      font-family: 'Inter', sans-serif;
      font-size: 0.58rem;
      font-weight: 500;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: #6b6560;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.08);
      padding: 0.15rem 0.5rem;
    }

    .sidebar-nav {
      flex: 1;
      padding: 1.25rem 0.875rem;
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
    }

    .nav-section-label {
      font-family: 'Inter', sans-serif;
      font-size: 0.58rem;
      font-weight: 600;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: #4a4540;
      padding: 0 0.625rem;
      margin: 0.75rem 0 0.375rem;
    }
    .nav-section-label:first-child { margin-top: 0; }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.625rem 0.875rem;
      font-family: 'Inter', sans-serif;
      font-size: 0.82rem;
      font-weight: 400;
      color: #6b6560;
      text-decoration: none;
      border: 1px solid transparent;
      transition: all 0.2s;
    }
    .nav-item:hover {
      color: #e8e0d6;
      background: rgba(255,255,255,0.04);
    }
    .nav-item.active {
      color: #c9a96e;
      background: rgba(201,169,110,0.08);
      border-color: rgba(201,169,110,0.18);
    }

    .pending-badge {
      margin-left: auto;
      background: rgba(217,119,6,0.2);
      border: 1px solid rgba(217,119,6,0.35);
      color: #d97706;
      font-size: 0.62rem;
      font-weight: 700;
      font-family: 'Inter', sans-serif;
      padding: 0.1rem 0.45rem;
      border-radius: 99px;
      min-width: 18px;
      text-align: center;
    }

    .sidebar-footer {
      padding: 0.875rem;
      border-top: 1px solid rgba(255,255,255,0.06);
    }
    .logout-btn {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      width: 100%;
      padding: 0.625rem 0.875rem;
      background: none;
      border: 1px solid transparent;
      font-family: 'Inter', sans-serif;
      font-size: 0.82rem;
      font-weight: 400;
      color: #6b6560;
      cursor: pointer;
      transition: all 0.2s;
      text-align: left;
    }
    .logout-btn:hover {
      color: #fca5a5;
      background: rgba(239,68,68,0.06);
      border-color: rgba(239,68,68,0.12);
    }

    /* ── Main ── */
    .main {
      margin-left: 240px;
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    .topbar {
      height: 72px;
      background: rgba(250,247,244,0.95);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid #e8e0d6;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 2rem;
      position: sticky;
      top: 0;
      z-index: 40;
    }
    .topbar-left {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .topbar-divider {
      width: 1px; height: 16px;
      background: #ddd8d0;
    }
    .topbar-label {
      font-family: 'Inter', sans-serif;
      font-size: 0.7rem;
      font-weight: 500;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: #9e9890;
    }
    .topbar-page {
      font-family: 'Inter', sans-serif;
      font-size: 0.82rem;
      font-weight: 500;
      color: #1a1410;
    }

    .pending-alert {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-family: 'Inter', sans-serif;
      font-size: 0.75rem;
      color: #d97706;
      background: rgba(217,119,6,0.06);
      border: 1px solid rgba(217,119,6,0.2);
      padding: 0.375rem 0.875rem;
    }
    .pulse-dot {
      width: 6px; height: 6px;
      border-radius: 50%;
      background: #d97706;
      animation: pulse 2s ease-in-out infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }

    .content {
      flex: 1;
      padding: 2.5rem 2rem;
      background: #faf7f4;
    }

    @media (max-width: 768px) {
      .sidebar { transform: translateX(-100%); }
      .main { margin-left: 0; }
    }
  `],
  template: `
    <div class="shell">

      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-logo">
          <svg width="34" height="38" viewBox="0 0 84 96" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="6" y="30" width="72" height="58" rx="8" fill="#1a1a1a"/>
            <path d="M28 30 C28 14 56 14 56 30" stroke="#c8960c" stroke-width="5.5" stroke-linecap="round" fill="none"/>
            <rect x="6" y="30" width="72" height="8" rx="4" fill="#c8960c"/>
            <text x="35" y="74" font-family="Georgia, serif" font-size="28" font-weight="700" fill="#f5d160" text-anchor="middle">T</text>
            <text x="51" y="74" font-family="Georgia, serif" font-size="28" font-weight="700" fill="#ffffff" text-anchor="middle">Z</text>
          </svg>
          <div class="logo-text-block">
            <div class="logo-wordmark-s"><span class="trend">TREND</span><span class="zy">ZY</span></div>
            <div class="logo-tagline-s">Premium · Style · Delivered</div>
          </div>
        </div>

        <nav class="sidebar-nav">
          <div class="nav-section-label">Menu</div>
          @for (link of navLinks; track link.path) {
            <a [routerLink]="link.path" routerLinkActive="active" class="nav-item">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path [attr.d]="link.svg"/>
              </svg>
              {{ link.label }}
              @if (link.label === 'Orders' && pendingCount() > 0) {
                <span class="pending-badge">{{ pendingCount() }}</span>
              }
            </a>
          }
        </nav>

        <div class="sidebar-footer">
          <button class="logout-btn" (click)="auth.logout()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            Logout
          </button>
        </div>
      </aside>

      <!-- Main -->
      <div class="main">
        <header class="topbar">
          <div class="topbar-left">
            <span class="topbar-label">Trendzy</span>
            <div class="topbar-divider"></div>
            <span class="topbar-page">Seller Panel</span>
          </div>
          @if (pendingCount() > 0) {
            <div class="pending-alert">
              <span class="pulse-dot"></span>
              {{ pendingCount() }} order{{ pendingCount() === 1 ? '' : 's' }} awaiting action
            </div>
          }
        </header>
        <div class="content">
          <router-outlet />
        </div>
      </div>

    </div>
  `
})
export class SellerLayoutComponent implements OnInit, OnDestroy {
  auth = inject(AuthService);
  private orderService = inject(OrderService);

  pendingCount = signal(0);
  private pollInterval: ReturnType<typeof setInterval> | null = null;

  navLinks = [
    { path: '/seller/dashboard', label: 'Dashboard', svg: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { path: '/seller/products',  label: 'Products',  svg: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    { path: '/seller/orders',    label: 'Orders',    svg: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
    { path: '/seller/scraper',   label: 'Scraper',   svg: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1' },
  ];

  ngOnInit() {
    this.fetchPendingCount();
    this.pollInterval = setInterval(() => this.fetchPendingCount(), 30_000);
  }
  ngOnDestroy() {
    if (this.pollInterval) clearInterval(this.pollInterval);
  }
  private fetchPendingCount() {
    this.orderService.getOrderCount().subscribe({
      next: ({ pending }) => this.pendingCount.set(pending),
      error: () => {}
    });
  }
}
