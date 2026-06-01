import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { OrderService } from '../../../services/order.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div>
      <h1 class="font-display text-3xl font-bold text-white mb-2">Dashboard</h1>
      <p class="text-gray-400 font-body mb-8">Welcome back to GlowMart Seller Panel</p>

      <!-- Stats -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        @for (stat of stats(); track stat.label) {
          <div class="glass rounded-2xl p-5 hover:border-white/10 transition-all">
            <div class="flex items-center justify-between mb-3">
              <span class="text-2xl">{{ stat.icon }}</span>
              <span class="text-xs font-body font-medium px-2 py-0.5 rounded-full bg-green-500/10 text-green-400">
                ↑ {{ stat.change }}
              </span>
            </div>
            <p class="font-display text-2xl font-bold text-white">{{ stat.value }}</p>
            <p class="text-xs font-body text-gray-500 mt-1">{{ stat.label }}</p>
          </div>
        }
      </div>

      <!-- Quick Actions -->
      <h2 class="font-display text-lg font-semibold text-white mb-4">Quick Actions</h2>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <a routerLink="/seller/scraper" class="glass rounded-2xl p-5 card-hover flex items-center gap-4 hover:border-brand-500/30 transition-all">
          <div class="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center text-2xl flex-shrink-0">🕷️</div>
          <div>
            <p class="font-body font-semibold text-white">Run Scraper</p>
            <p class="text-xs font-body text-gray-400">Import from Oriflame</p>
          </div>
        </a>
        <a routerLink="/seller/orders" class="glass rounded-2xl p-5 card-hover flex items-center gap-4 hover:border-brand-500/30 transition-all">
          <div class="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-2xl flex-shrink-0">📋</div>
          <div>
            <p class="font-body font-semibold text-white">Manage Orders</p>
            <p class="text-xs font-body text-gray-400">Update order status</p>
          </div>
        </a>
        <a routerLink="/seller/products" class="glass rounded-2xl p-5 card-hover flex items-center gap-4 hover:border-brand-500/30 transition-all">
          <div class="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-2xl flex-shrink-0">✏️</div>
          <div>
            <p class="font-body font-semibold text-white">Edit Products</p>
            <p class="text-xs font-body text-gray-400">Prices &amp; descriptions</p>
          </div>
        </a>
      </div>

      <!-- Recent Orders -->
      @if (recentOrders().length > 0) {
        <h2 class="font-display text-lg font-semibold text-white mb-4">Recent Orders</h2>
        <div class="glass rounded-2xl overflow-hidden">
          <div class="divide-y divide-white/5">
            @for (order of recentOrders(); track order.id) {
              <div class="flex items-center justify-between px-5 py-4">
                <div class="flex items-center gap-3">
                  <span class="font-mono text-xs text-gray-500">#{{ order.id }}</span>
                  <span class="font-body text-sm text-white">{{ order.buyerName }}</span>
                  <span class="text-xs text-gray-500">{{ order.buyerCity }}</span>
                </div>
                <div class="flex items-center gap-3">
                  <span class="font-body text-sm text-brand-400 font-semibold">PKR {{ order.total | number }}</span>
                  <span class="px-2 py-0.5 rounded-full text-xs font-body font-medium"
                    [class.bg-yellow-500]="order.status==='pending'" [class.text-yellow-900]="order.status==='pending'"
                    [class.bg-blue-500]="order.status==='confirmed'" [class.text-blue-900]="order.status==='confirmed'"
                    [class.bg-green-500]="order.status==='delivered'" [class.text-green-900]="order.status==='delivered'">
                    {{ order.status | titlecase }}
                  </span>
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class DashboardComponent implements OnInit {
  private productService = inject(ProductService);
  private orderService = inject(OrderService);

  stats = signal([
    { icon: '📦', label: 'Total Products', value: '—', change: 'loading', trend: 'up' },
    { icon: '🛍️', label: 'Total Orders', value: '—', change: 'loading', trend: 'up' },
    { icon: '💰', label: 'Revenue (PKR)', value: '—', change: 'this month', trend: 'up' },
    { icon: '⏳', label: 'Pending Orders', value: '—', change: 'need action', trend: 'up' },
  ]);

  recentOrders = signal<any[]>([]);

  ngOnInit() {
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.stats.update(s => s.map((stat, i) =>
          i === 0 ? { ...stat, value: String(products.length), change: 'active' } : stat
        ));
      }
    });

    this.orderService.getOrders().subscribe({
      next: (orders) => {
        const pending = orders.filter(o => o.status === 'pending').length;
        const revenue = orders.reduce((sum, o) => sum + o.total, 0);
        this.stats.update(s => s.map((stat, i) => {
          if (i === 1) return { ...stat, value: String(orders.length), change: `${pending} pending` };
          if (i === 2) return { ...stat, value: revenue.toLocaleString(), change: 'total' };
          if (i === 3) return { ...stat, value: String(pending), change: 'need action' };
          return stat;
        }));
        this.recentOrders.set(orders.slice(0, 5));
      },
      error: () => {
        // Fallback stats when backend is unavailable
        this.stats.set([
          { icon: '📦', label: 'Total Products', value: '6', change: 'mock data', trend: 'up' },
          { icon: '🛍️', label: 'Total Orders', value: '3', change: '1 pending', trend: 'up' },
          { icon: '💰', label: 'Revenue (PKR)', value: '8,150', change: 'total', trend: 'up' },
          { icon: '⏳', label: 'Pending Orders', value: '1', change: 'need action', trend: 'up' },
        ]);
      }
    });
  }
}
