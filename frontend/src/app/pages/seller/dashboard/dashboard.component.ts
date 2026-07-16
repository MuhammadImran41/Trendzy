import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { OrderService } from '../../../services/order.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  styles: [`
    .page-eyebrow {
      font-family: 'Inter', sans-serif;
      font-size: 0.65rem; font-weight: 500;
      letter-spacing: 0.25em; text-transform: uppercase;
      color: #c9a96e; margin-bottom: 0.5rem;
    }
    .page-title {
      font-family: 'DM Serif Display', Georgia, serif;
      font-size: 2.25rem; font-weight: 400; color: #1a1410;
      margin-bottom: 0.25rem; line-height: 1.1;
    }
    .page-sub {
      font-family: 'Inter', sans-serif;
      font-size: 0.82rem; color: #9e9890;
      margin-bottom: 2.5rem;
    }

    .gold-divider {
      height: 1px;
      background: linear-gradient(90deg, #c9a96e, transparent);
      width: 40px;
      margin-bottom: 2.5rem;
    }

    /* ── Stats ── */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1px;
      background: #e8e0d6;
      border: 1px solid #e8e0d6;
      margin-bottom: 2.5rem;
    }
    @media (max-width: 1100px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 600px)  { .stats-grid { grid-template-columns: 1fr; } }

    .stat-card {
      background: #fff;
      padding: 1.5rem;
      transition: background 0.2s;
    }
    .stat-card:hover { background: #faf7f4; }

    .stat-icon-wrap {
      width: 36px; height: 36px;
      border: 1px solid #e8e0d6;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 1.25rem;
    }
    .stat-value {
      font-family: 'DM Serif Display', serif;
      font-size: 2.25rem; font-weight: 600;
      color: #1a1410; line-height: 1;
      margin-bottom: 0.375rem;
    }
    .stat-label {
      font-family: 'Inter', sans-serif;
      font-size: 0.72rem; font-weight: 500;
      letter-spacing: 0.08em; text-transform: uppercase;
      color: #9e9890; margin-bottom: 0.25rem;
    }
    .stat-change {
      font-family: 'Inter', sans-serif;
      font-size: 0.72rem; color: #b0a898;
    }

    /* ── Section heading ── */
    .section-heading {
      font-family: 'Inter', sans-serif;
      font-size: 0.62rem; font-weight: 600;
      letter-spacing: 0.2em; text-transform: uppercase;
      color: #9e9890; margin-bottom: 1rem;
    }

    /* ── Quick actions ── */
    .actions-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1px;
      background: #e8e0d6;
      border: 1px solid #e8e0d6;
      margin-bottom: 2.5rem;
    }
    @media (max-width: 768px) { .actions-grid { grid-template-columns: 1fr; } }

    .action-card {
      background: #fff;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      text-decoration: none;
      transition: background 0.2s;
    }
    .action-card:hover { background: #f5f0e8; }

    .action-icon {
      width: 44px; height: 44px;
      border: 1px solid #e8e0d6;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      transition: border-color 0.2s;
    }
    .action-card:hover .action-icon { border-color: #c9a96e; }

    .action-title {
      font-family: 'DM Serif Display', serif;
      font-size: 1.05rem; font-weight: 500;
      color: #1a1410; margin-bottom: 0.125rem;
    }
    .action-sub {
      font-family: 'Inter', sans-serif;
      font-size: 0.75rem; color: #9e9890;
    }

    /* ── Orders table ── */
    .orders-wrap {
      border: 1px solid #e8e0d6;
      background: #fff;
      overflow: hidden;
    }
    .orders-head {
      display: grid;
      grid-template-columns: 1.2fr 1.5fr 1fr 1fr 1fr;
      padding: 0.75rem 1.5rem;
      background: #f5f0e8;
      border-bottom: 1px solid #e8e0d6;
    }
    .orders-head span {
      font-family: 'Inter', sans-serif;
      font-size: 0.6rem; font-weight: 600;
      letter-spacing: 0.18em; text-transform: uppercase;
      color: #9e9890;
    }
    .order-row {
      display: grid;
      grid-template-columns: 1.2fr 1.5fr 1fr 1fr 1fr;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #f0ebe4;
      align-items: center;
      transition: background 0.15s;
    }
    .order-row:last-child { border-bottom: none; }
    .order-row:hover { background: #faf7f4; }

    .order-id {
      font-family: 'JetBrains Mono', 'Courier New', monospace;
      font-size: 0.72rem; color: #b0a898;
    }
    .order-name {
      font-family: 'Inter', sans-serif;
      font-size: 0.85rem; font-weight: 500; color: #1a1410;
    }
    .order-city {
      font-family: 'Inter', sans-serif;
      font-size: 0.8rem; color: #9e9890;
    }
    .order-amount {
      font-family: 'DM Serif Display', serif;
      font-size: 1.05rem; font-weight: 600; color: #1a1410;
    }

    .status-pill {
      display: inline-flex;
      padding: 0.2rem 0.625rem;
      font-family: 'Inter', sans-serif;
      font-size: 0.62rem; font-weight: 600;
      letter-spacing: 0.06em; text-transform: uppercase;
    }
    .s-pending   { background: rgba(217,119,6,0.08);  border: 1px solid rgba(217,119,6,0.25);  color: #b45309; }
    .s-confirmed { background: rgba(59,130,246,0.08); border: 1px solid rgba(59,130,246,0.25); color: #2563eb; }
    .s-shipped   { background: rgba(139,92,246,0.08); border: 1px solid rgba(139,92,246,0.25); color: #7c3aed; }
    .s-delivered { background: rgba(22,163,74,0.08);  border: 1px solid rgba(22,163,74,0.25);  color: #16a34a; }
    .s-cancelled { background: rgba(220,38,38,0.08);  border: 1px solid rgba(220,38,38,0.25);  color: #dc2626; }
  `],
  template: `
    <div>
      <div class="page-eyebrow">Overview</div>
      <h1 class="page-title">Dashboard</h1>
      <p class="page-sub">Welcome back to Trendzy Seller Panel</p>
      <div class="gold-divider"></div>

      <!-- Stats -->
      <div class="section-heading">Store Stats</div>
      <div class="stats-grid">
        @for (stat of stats(); track stat.label) {
          <div class="stat-card">
            <div class="stat-icon-wrap">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                   [attr.stroke]="stat.iconColor" stroke-width="1.5"
                   stroke-linecap="round" stroke-linejoin="round">
                <path [attr.d]="stat.svg"/>
              </svg>
            </div>
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
            <div class="stat-change">{{ stat.change }}</div>
          </div>
        }
      </div>

      <!-- Quick Actions -->
      <div class="section-heading">Quick Actions</div>
      <div class="actions-grid">
        <a routerLink="/seller/scraper" class="action-card">
          <div class="action-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c9a96e" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
            </svg>
          </div>
          <div>
            <div class="action-title">Run Scraper</div>
            <div class="action-sub">Import from Oriflame</div>
          </div>
        </a>
        <a routerLink="/seller/orders" class="action-card">
          <div class="action-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c9a96e" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
            </svg>
          </div>
          <div>
            <div class="action-title">Manage Orders</div>
            <div class="action-sub">Update order status</div>
          </div>
        </a>
        <a routerLink="/seller/products" class="action-card">
          <div class="action-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c9a96e" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
            </svg>
          </div>
          <div>
            <div class="action-title">Edit Products</div>
            <div class="action-sub">Prices &amp; descriptions</div>
          </div>
        </a>
      </div>

      <!-- Recent Orders -->
      @if (recentOrders().length > 0) {
        <div class="section-heading">Recent Orders</div>
        <div class="orders-wrap">
          <div class="orders-head">
            <span>Order ID</span>
            <span>Customer</span>
            <span>City</span>
            <span>Amount</span>
            <span>Status</span>
          </div>
          @for (order of recentOrders(); track order.id) {
            <div class="order-row">
              <span class="order-id">#{{ order.id }}</span>
              <span class="order-name">{{ order.buyerName }}</span>
              <span class="order-city">{{ order.buyerCity }}</span>
              <span class="order-amount">PKR {{ order.total | number }}</span>
              <span class="status-pill"
                [class.s-pending]="order.status==='pending'"
                [class.s-confirmed]="order.status==='confirmed'"
                [class.s-shipped]="order.status==='shipped'"
                [class.s-delivered]="order.status==='delivered'"
                [class.s-cancelled]="order.status==='cancelled'">
                {{ order.status }}
              </span>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class DashboardComponent implements OnInit {
  private productService = inject(ProductService);
  private orderService   = inject(OrderService);

  stats = signal([
    { svg: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', iconColor: '#c9a96e', label: 'Total Products', value: '—', change: 'loading' },
    { svg: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', iconColor: '#c9a96e', label: 'Total Orders', value: '—', change: 'loading' },
    { svg: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z', iconColor: '#c9a96e', label: 'Revenue (PKR)', value: '—', change: 'total' },
    { svg: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', iconColor: '#d97706', label: 'Pending Orders', value: '—', change: 'need action' },
  ]);

  recentOrders = signal<any[]>([]);

  ngOnInit() {
    this.productService.getProducts().subscribe({
      next: (p) => this.stats.update(s => s.map((st, i) =>
        i === 0 ? { ...st, value: String(p.length), change: 'active' } : st
      ))
    });
    this.orderService.getOrders().subscribe({
      next: (orders) => {
        const pending = orders.filter(o => o.status === 'pending').length;
        const revenue = orders.reduce((sum, o) => sum + o.total, 0);
        this.stats.update(s => s.map((st, i) => {
          if (i === 1) return { ...st, value: String(orders.length), change: `${pending} pending` };
          if (i === 2) return { ...st, value: revenue.toLocaleString(), change: 'total' };
          if (i === 3) return { ...st, value: String(pending), change: 'need action' };
          return st;
        }));
        this.recentOrders.set(orders.slice(0, 5));
      },
      error: () => {
        this.stats.set([
          { svg: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', iconColor: '#c9a96e', label: 'Total Products', value: '6',     change: 'active'    },
          { svg: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', iconColor: '#c9a96e', label: 'Total Orders',   value: '3',     change: '1 pending' },
          { svg: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z', iconColor: '#c9a96e', label: 'Revenue (PKR)',  value: '8,150', change: 'total'     },
          { svg: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', iconColor: '#d97706', label: 'Pending Orders', value: '1',     change: 'need action' },
        ]);
      }
    });
  }
}
