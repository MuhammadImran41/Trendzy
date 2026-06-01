import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-seller-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="min-h-screen bg-dark-900 flex">

      <!-- Sidebar -->
      <aside class="w-64 bg-dark-800 border-r border-white/5 flex flex-col fixed top-0 bottom-0 left-0 z-40">
        <div class="h-16 flex items-center px-6 border-b border-white/5">
          <span class="font-display text-lg font-bold gradient-text">GlowMart</span>
          <span class="ml-2 text-xs font-mono text-gray-500 bg-dark-700 px-2 py-0.5 rounded">Seller</span>
        </div>

        <nav class="flex-1 p-4 space-y-1">
          @for (link of navLinks; track link.path) {
            <a [routerLink]="link.path" routerLinkActive="bg-brand-600/20 text-brand-300 border-brand-500/40"
               class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all border border-transparent">
              <span class="text-lg">{{ link.icon }}</span>
              <span class="flex-1">{{ link.label }}</span>
              <!-- Pending badge on Orders link -->
              @if (link.label === 'Orders' && pendingCount() > 0) {
                <span class="px-2 py-0.5 bg-yellow-500 text-yellow-900 rounded-full text-xs font-bold min-w-[20px] text-center">
                  {{ pendingCount() }}
                </span>
              }
            </a>
          }
        </nav>

        <div class="p-4 border-t border-white/5">
          <button (click)="auth.logout()"
            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
            <span class="text-lg">🚪</span> Logout
          </button>
        </div>
      </aside>

      <!-- Main -->
      <div class="ml-64 flex-1 min-h-screen">
        <header class="h-16 bg-dark-800 border-b border-white/5 flex items-center justify-between px-8">
          <h1 class="text-sm font-body text-gray-400">Seller Panel</h1>
          @if (pendingCount() > 0) {
            <span class="flex items-center gap-2 text-xs font-body text-yellow-400">
              <span class="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
              {{ pendingCount() }} order{{ pendingCount() === 1 ? '' : 's' }} awaiting action
            </span>
          }
        </header>
        <main class="p-8">
          <router-outlet />
        </main>
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
    { path: '/seller/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/seller/products',  icon: '📦', label: 'Products'  },
    { path: '/seller/orders',    icon: '🛍️', label: 'Orders'    },
    { path: '/seller/scraper',   icon: '🕷️', label: 'Scraper'   },
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
      error: () => {}   // silently ignore when backend is offline
    });
  }
}
