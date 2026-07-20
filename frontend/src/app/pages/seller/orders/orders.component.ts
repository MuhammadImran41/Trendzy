import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../services/order.service';
import { Order } from '../../../models/order.model';

@Component({
  selector: 'app-seller-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
    .page-eyebrow { font-family:'Inter', sans-serif; font-size:0.65rem; font-weight:600; letter-spacing:0.25em; text-transform:uppercase; color:#c9a96e; margin-bottom:0.5rem; }
    .page-title   { font-family:'DM Serif Display', Georgia, serif; font-size:2.25rem; font-weight:400; color:#1a1410; margin-bottom:0.25rem; }
    .page-sub     { font-family:'Inter', sans-serif; font-size:0.82rem; color:#9e9890; margin-bottom:2rem; }
    .gold-line    { height:1px; background:linear-gradient(90deg,#c9a96e,transparent); width:40px; margin-bottom:2rem; }

    /* ── Toolbar ── */
    .toolbar { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:0.75rem; margin-bottom:1.5rem; }

    .new-alert {
      display:flex; align-items:center; gap:0.5rem;
      padding:0.375rem 0.875rem;
      background:rgba(201,169,110,0.08); border:1px solid rgba(201,169,110,0.25);
      font-family:'Inter', sans-serif; font-size:0.75rem; color:#c9a96e;
      animation: pulse-border 2s ease-in-out infinite;
    }
    @keyframes pulse-border { 0%,100%{border-color:rgba(201,169,110,0.25)} 50%{border-color:rgba(201,169,110,0.6)} }

    .pending-pill {
      padding:0.3rem 0.875rem;
      background:rgba(217,119,6,0.08); border:1px solid rgba(217,119,6,0.25);
      font-family:'Inter', sans-serif; font-size:0.72rem; font-weight:600; color:#d97706;
    }
    .refresh-btn {
      display:flex; align-items:center; gap:0.375rem;
      padding:0.375rem 0.875rem;
      background:#fff; border:1px solid #ddd8d0;
      font-family:'Inter', sans-serif; font-size:0.75rem; color:#6b6560;
      cursor:pointer; transition:all 0.2s;
    }
    .refresh-btn:hover { border-color:#c9a96e; color:#1a1410; }

    /* ── Filter tabs ── */
    .filter-tabs { display:flex; gap:0; border:1px solid #e8e0d6; background:#fff; margin-bottom:1.5rem; overflow-x:auto; }
    .filter-tab {
      padding:0.5rem 1.125rem;
      font-family:'Inter', sans-serif; font-size:0.75rem; font-weight:500;
      color:#9e9890; background:none; border:none; border-right:1px solid #e8e0d6;
      cursor:pointer; transition:all 0.2s; white-space:nowrap;
    }
    .filter-tab:last-child { border-right:none; }
    .filter-tab:hover { color:#1a1410; background:#faf7f4; }
    .filter-tab.active { color:#1a1410; background:#f5f0e8; font-weight:600; }
    .filter-count { font-size:0.65rem; color:#b0a898; margin-left:0.25rem; }

    /* ── Empty ── */
    .empty-state { padding:4rem 2rem; text-align:center; background:#fff; border:1px solid #e8e0d6; }
    .empty-icon  { display:flex; justify-content:center; margin-bottom:1rem; }
    .empty-text  { font-family:'DM Serif Display', serif; font-size:1.25rem; color:#9e9890; }

    /* ── Order card ── */
    .order-card {
      background:#fff; border:1px solid #e8e0d6;
      margin-bottom:1px; transition:background 0.15s;
    }
    .order-card:hover { background:#faf7f4; }
    .order-card.is-new { border-color:#c9a96e; }

    .order-card-inner { padding:1.25rem 1.5rem; }

    .new-badge {
      display:inline-flex; align-items:center; gap:0.375rem;
      padding:0.2rem 0.625rem;
      background:rgba(201,169,110,0.1); border:1px solid rgba(201,169,110,0.3);
      font-family:'Inter', sans-serif; font-size:0.62rem; font-weight:700;
      letter-spacing:0.12em; text-transform:uppercase; color:#c9a96e;
      margin-bottom:0.875rem;
    }

    .order-top { display:flex; align-items:flex-start; justify-content:space-between; gap:1rem; flex-wrap:wrap; }
    .order-left { flex:1; min-width:0; }
    .order-right { text-align:right; flex-shrink:0; }

    .order-meta { display:flex; align-items:center; gap:0.75rem; margin-bottom:0.5rem; flex-wrap:wrap; }
    .order-id { font-family:'JetBrains Mono','Courier New',monospace; font-size:0.72rem; color:#b0a898; }

    .status-pill { display:inline-flex; padding:0.2rem 0.625rem; font-family:'Inter', sans-serif; font-size:0.62rem; font-weight:600; letter-spacing:0.06em; text-transform:uppercase; }
    .s-pending   { background:rgba(217,119,6,0.08);  border:1px solid rgba(217,119,6,0.25);  color:#b45309; }
    .s-confirmed { background:rgba(59,130,246,0.08); border:1px solid rgba(59,130,246,0.25); color:#2563eb; }
    .s-shipped   { background:rgba(139,92,246,0.08); border:1px solid rgba(139,92,246,0.25); color:#7c3aed; }
    .s-delivered { background:rgba(22,163,74,0.08);  border:1px solid rgba(22,163,74,0.25);  color:#16a34a; }
    .s-cancelled { background:rgba(220,38,38,0.08);  border:1px solid rgba(220,38,38,0.25);  color:#dc2626; }

    .buyer-name { font-family:'DM Serif Display', serif; font-size:1.2rem; font-weight:500; color:#1a1410; margin-bottom:0.25rem; }
    .buyer-info { font-family:'Inter', sans-serif; font-size:0.78rem; color:#9e9890; display:flex; align-items:center; gap:0.375rem; margin-bottom:0.125rem; }
    .buyer-note { font-family:'Inter', sans-serif; font-size:0.75rem; color:#b0a898; font-style:italic; margin-top:0.25rem; }

    .order-items { margin-top:0.875rem; display:flex; flex-direction:column; gap:0.375rem; }
    .order-item  { display:flex; align-items:center; gap:0.625rem; }
    .item-img    { width:32px; height:32px; object-fit:cover; background:#f5f0e8; flex-shrink:0; }
    .item-name   { font-family:'Inter', sans-serif; font-size:0.78rem; color:#6b6560; flex:1; min-width:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .item-qty    { font-family:'Inter', sans-serif; font-size:0.72rem; color:#b0a898; }
    .item-price  { font-family:'Inter', sans-serif; font-size:0.78rem; font-weight:500; color:#1a1410; }

    .order-total { font-family:'DM Serif Display', serif; font-size:1.5rem; font-weight:600; color:#1a1410; }
    .order-cod   { font-family:'Inter', sans-serif; font-size:0.7rem; color:#9e9890; margin-top:0.125rem; }

    /* ── Action buttons ── */
    .actions { display:flex; flex-wrap:wrap; gap:0.5rem; justify-content:flex-end; margin-top:0.875rem; }
    .btn-action {
      display:flex; align-items:center; gap:0.375rem;
      padding:0.4rem 0.875rem;
      font-family:'Inter', sans-serif; font-size:0.72rem; font-weight:500;
      border:1px solid; cursor:pointer; transition:all 0.2s;
    }
    .btn-confirm  { background:rgba(37,99,235,0.06); border-color:rgba(37,99,235,0.25); color:#2563eb; }
    .btn-confirm:hover  { background:rgba(37,99,235,0.12); }
    .btn-cancel   { background:rgba(220,38,38,0.06); border-color:rgba(220,38,38,0.25); color:#dc2626; }
    .btn-cancel:hover   { background:rgba(220,38,38,0.12); }
    .btn-ship     { background:rgba(124,58,237,0.06); border-color:rgba(124,58,237,0.25); color:#7c3aed; }
    .btn-ship:hover     { background:rgba(124,58,237,0.12); }
    .btn-deliver  { background:rgba(22,163,74,0.06); border-color:rgba(22,163,74,0.25); color:#16a34a; }
    .btn-deliver:hover  { background:rgba(22,163,74,0.12); }

    .tracking-row { display:flex; align-items:center; gap:0.5rem; width:100%; justify-content:flex-end; }
    .tracking-input {
      padding:0.375rem 0.75rem;
      background:#fff; border:1px solid #ddd8d0;
      font-family:'Inter', sans-serif; font-size:0.75rem; color:#1a1410;
      outline:none; width:160px;
    }
    .tracking-input:focus { border-color:#c9a96e; }
    .tracking-info { display:flex; align-items:center; gap:0.375rem; font-family:'Inter', sans-serif; font-size:0.72rem; color:#9e9890; }
    .tracking-id   { font-family:'JetBrains Mono',monospace; font-size:0.72rem; color:#7c3aed; }
    .delivered-tag { display:flex; align-items:center; gap:0.375rem; font-family:'Inter', sans-serif; font-size:0.72rem; color:#16a34a; }
  `],
  template: `
    <div>
      <div class="page-eyebrow">Manage</div>
      <h1 class="page-title">Orders</h1>
      <p class="page-sub">Customer orders · auto-refreshes every 30s</p>
      <div class="gold-line"></div>

      <!-- Toolbar -->
      <div class="toolbar">
        <div style="display:flex;align-items:center;gap:0.75rem;flex-wrap:wrap;">
          @if (newOrderAlert()) {
            <div class="new-alert">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>
              New order received!
            </div>
          }
          @if (pendingCount() > 0) {
            <div class="pending-pill">{{ pendingCount() }} pending</div>
          }
        </div>
        <button class="refresh-btn" (click)="loadOrders()">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
          Refresh
        </button>
      </div>

      <!-- Filter tabs -->
      <div class="filter-tabs">
        @for (s of statuses; track s) {
          <button class="filter-tab" [class.active]="filter() === s" (click)="filter.set(s)">
            {{ s }}
            @if (s !== 'All') {
              <span class="filter-count">({{ countByStatus(s) }})</span>
            }
          </button>
        }
      </div>

      <!-- Loading -->
      @if (loading()) {
        <div style="padding:3rem;text-align:center;font-family:'Inter', sans-serif;font-size:0.85rem;color:#9e9890;">
          Loading orders...
        </div>
      }

      <!-- Empty -->
      @else if (filteredOrders().length === 0) {
        <div class="empty-state">
          <div class="empty-icon">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ddd8d0" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
          </div>
          <div class="empty-text">No orders found</div>
        </div>
      }

      <!-- Orders -->
      @else {
        <div>
          @for (order of filteredOrders(); track order.id) {
            <div class="order-card" [class.is-new]="isNew(order.id)">
              <div class="order-card-inner">

                @if (isNew(order.id)) {
                  <div class="new-badge">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>
                    New
                  </div>
                }

                <div class="order-top">
                  <div class="order-left">
                    <div class="order-meta">
                      <span class="order-id">#{{ order.id }}</span>
                      <span class="status-pill"
                        [class.s-pending]="order.status==='pending'"
                        [class.s-confirmed]="order.status==='confirmed'"
                        [class.s-shipped]="order.status==='shipped'"
                        [class.s-delivered]="order.status==='delivered'"
                        [class.s-cancelled]="order.status==='cancelled'">
                        {{ order.status }}
                      </span>
                    </div>

                    <div class="buyer-name">{{ order.buyerName }}</div>
                    <div class="buyer-info">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                      {{ order.buyerPhone }} · {{ order.buyerCity }}
                    </div>
                    <div class="buyer-info">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                      {{ order.buyerAddress }}
                    </div>
                    @if (order.notes) {
                      <div class="buyer-note">{{ order.notes }}</div>
                    }

                    <div class="order-items">
                      @for (item of order.items; track item.productId) {
                        <div class="order-item">
                          <img [src]="item.productImage || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100'"
                               class="item-img" [alt]="item.productName"
                               onerror="this.src='https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100'" />
                          <span class="item-name">{{ item.productName }}</span>
                          <span class="item-qty">×{{ item.quantity }}</span>
                          <span class="item-price">PKR {{ (item.price * item.quantity) | number }}</span>
                        </div>
                      }
                    </div>
                  </div>

                  <div class="order-right">
                    <div class="order-total">PKR {{ order.total | number }}</div>
                    <div class="order-cod">{{ order.items.length }} item(s) · COD</div>

                    <div class="actions">
                      @if (order.status === 'pending') {
                        <button class="btn-action btn-confirm" (click)="updateStatus(order, 'confirmed')">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                          Confirm
                        </button>
                        <button class="btn-action btn-cancel" (click)="updateStatus(order, 'cancelled')">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                          Cancel
                        </button>
                      }
                      @if (order.status === 'confirmed') {
                        <div class="tracking-row">
                          <input class="tracking-input" [(ngModel)]="trackingInputs[order.id]"
                            type="text" placeholder="Tracking ID (optional)" />
                          <button class="btn-action btn-ship" (click)="updateStatus(order, 'shipped', trackingInputs[order.id])">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"/></svg>
                            Mark Shipped
                          </button>
                        </div>
                      }
                      @if (order.status === 'shipped') {
                        @if (order.trackingId) {
                          <div class="tracking-info">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                            Tracking: <span class="tracking-id">{{ order.trackingId }}</span>
                          </div>
                        }
                        <button class="btn-action btn-deliver" (click)="updateStatus(order, 'delivered')">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                          Mark Delivered
                        </button>
                      }
                      @if (order.status === 'delivered') {
                        <div class="delivered-tag">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                          Delivered
                        </div>
                      }
                    </div>
                  </div>
                </div>

              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class SellerOrdersComponent implements OnInit, OnDestroy {
  private orderService = inject(OrderService);

  filter        = signal('All');
  loading       = signal(false);
  orders        = signal<Order[]>([]);
  newOrderIds   = signal<Set<string>>(new Set());
  newOrderAlert = signal(false);
  statuses      = ['All', 'Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];
  trackingInputs: Record<string, string> = {};

  private pollInterval: ReturnType<typeof setInterval> | null = null;
  private lastKnownCount = 0;

  pendingCount   = computed(() => this.orders().filter(o => o.status === 'pending').length);
  filteredOrders = computed(() => {
    const f = this.filter().toLowerCase();
    return f === 'all' ? this.orders() : this.orders().filter(o => o.status === f);
  });

  countByStatus(s: string) { return this.orders().filter(o => o.status === s.toLowerCase()).length; }
  isNew(id: string)        { return this.newOrderIds().has(id); }

  ngOnInit()    { this.loadOrders(); this.pollInterval = setInterval(() => this.pollForNewOrders(), 30_000); }
  ngOnDestroy() { if (this.pollInterval) clearInterval(this.pollInterval); }

  loadOrders() {
    this.loading.set(true);
    this.orderService.getOrders().subscribe({
      next:  (o) => { this.lastKnownCount = o.length; this.orders.set(o); this.loading.set(false); },
      error: ()  => { this.orders.set(this.mockOrders); this.loading.set(false); }
    });
  }

  private pollForNewOrders() {
    this.orderService.getOrderCount().subscribe({
      next: ({ total }) => {
        if (total > this.lastKnownCount) {
          const prevIds = new Set(this.orders().map(o => o.id));
          this.orderService.getOrders().subscribe({ next: (orders) => {
            this.lastKnownCount = orders.length;
            const fresh = new Set(orders.filter(o => !prevIds.has(o.id)).map(o => o.id));
            if (fresh.size > 0) {
              this.newOrderIds.set(fresh); this.newOrderAlert.set(true);
              setTimeout(() => { this.newOrderAlert.set(false); this.newOrderIds.set(new Set()); }, 10_000);
            }
            this.orders.set(orders);
          }});
        }
      }
    });
  }

  updateStatus(order: Order, status: Order['status'], trackingId?: string) {
    this.orderService.updateOrderStatus(order.id, status, trackingId).subscribe({
      next:  (u) => this.orders.update(l => l.map(o => o.id === u.id ? u : o)),
      error: ()  => this.orders.update(l => l.map(o => o.id === order.id ? { ...o, status } : o))
    });
  }

  private mockOrders: Order[] = [
    { id:'GM-001', buyerName:'Ayesha Siddiqui', buyerPhone:'0312-3456789', buyerCity:'Karachi', buyerAddress:'House 12, Block 5, Gulshan-e-Iqbal', items:[{productId:'1',productName:'HydraFusion Night Cream',productImage:'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400',quantity:2,price:2200}], total:4400, status:'pending', paymentMethod:'cod', createdAt:new Date(), updatedAt:new Date() },
    { id:'GM-002', buyerName:'Sara Ahmed',      buyerPhone:'0321-9876543', buyerCity:'Lahore',  buyerAddress:'Flat 3B, DHA Phase 4',                items:[{productId:'2',productName:'Velvet Rose Lipstick',productImage:'https://images.unsplash.com/photo-1586495777744-4e6232bf9f06?w=400',quantity:1,price:950}],  total:950,  status:'confirmed', paymentMethod:'cod', createdAt:new Date(), updatedAt:new Date() },
    { id:'GM-003', buyerName:'Zara Malik',       buyerPhone:'0333-1122334', buyerCity:'Islamabad',buyerAddress:'F-7/2, Street 14',                   items:[{productId:'3',productName:'Glow Serum Pro',productImage:'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400',quantity:1,price:2800}], total:2800, status:'shipped',   paymentMethod:'cod', createdAt:new Date(), updatedAt:new Date() },
  ];
}
