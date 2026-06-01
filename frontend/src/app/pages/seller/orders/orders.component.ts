import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../services/order.service';
import { Order } from '../../../models/order.model';

@Component({
  selector: 'app-seller-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-3">
          <h1 class="font-display text-3xl font-bold text-white">Orders</h1>
          <!-- Live new-order badge -->
          @if (newOrderAlert()) {
            <span class="flex items-center gap-1.5 px-3 py-1 bg-brand-600/20 border border-brand-500/40
                         rounded-full text-brand-300 text-xs font-body font-semibold animate-pulse">
              🔔 New order received!
            </span>
          }
        </div>
        <div class="flex items-center gap-2">
          <!-- Pending count pill -->
          @if (pendingCount() > 0) {
            <span class="px-3 py-1 bg-yellow-500/15 border border-yellow-500/30 rounded-full
                         text-yellow-400 text-xs font-body font-semibold">
              ⏳ {{ pendingCount() }} pending
            </span>
          }
          <button (click)="loadOrders()" class="px-3 py-1.5 glass rounded-xl text-xs font-body text-gray-400 hover:text-white transition-colors">
            🔄 Refresh
          </button>
        </div>
      </div>
      <p class="text-gray-400 font-body text-sm mb-8">Manage customer orders · auto-refreshes every 30s</p>

      <!-- Status filter -->
      <div class="flex gap-2 mb-6 flex-wrap">
        @for (s of statuses; track s) {
          <button (click)="filter.set(s)"
            [class.bg-brand-600]="filter() === s" [class.text-white]="filter() === s"
            [class.glass]="filter() !== s" [class.text-gray-400]="filter() !== s"
            class="px-4 py-2 rounded-xl text-sm font-body font-medium transition-all">
            {{ s }}
            @if (s !== 'All') {
              <span class="ml-1 text-xs opacity-70">({{ countByStatus(s) }})</span>
            }
          </button>
        }
      </div>

      @if (loading()) {
        <div class="text-center py-16 text-gray-500 font-body">Loading orders...</div>
      } @else if (filteredOrders().length === 0) {
        <div class="text-center py-16 glass rounded-2xl">
          <p class="text-4xl mb-3">📋</p>
          <p class="text-gray-400 font-body">No orders found</p>
        </div>
      } @else {
        <div class="space-y-4">
          @for (order of filteredOrders(); track order.id) {
            <div class="glass rounded-2xl p-5 transition-all hover:border-white/10"
                 [class.ring-1]="isNew(order.id)"
                 [class.ring-brand-500]="isNew(order.id)">

              <!-- NEW badge -->
              @if (isNew(order.id)) {
                <div class="flex items-center gap-2 mb-3">
                  <span class="px-2 py-0.5 bg-brand-600/30 border border-brand-500/50 rounded-full
                               text-brand-300 text-xs font-body font-bold uppercase tracking-widest">
                    ✨ New
                  </span>
                </div>
              }

              <div class="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <div class="flex items-center gap-3 mb-1">
                    <span class="font-mono text-xs text-gray-500">#{{ order.id }}</span>
                    <span class="px-2.5 py-0.5 rounded-full text-xs font-body font-semibold"
                      [class.bg-yellow-500]="order.status==='pending'" [class.text-yellow-900]="order.status==='pending'"
                      [class.bg-blue-500]="order.status==='confirmed'" [class.text-blue-900]="order.status==='confirmed'"
                      [class.bg-purple-500]="order.status==='shipped'" [class.text-purple-900]="order.status==='shipped'"
                      [class.bg-green-500]="order.status==='delivered'" [class.text-green-900]="order.status==='delivered'"
                      [class.bg-red-500]="order.status==='cancelled'" [class.text-red-100]="order.status==='cancelled'">
                      {{ order.status | titlecase }}
                    </span>
                  </div>
                  <p class="font-body font-semibold text-white text-lg">{{ order.buyerName }}</p>
                  <p class="font-body text-sm text-gray-400 mt-0.5">📞 {{ order.buyerPhone }} &mdash; {{ order.buyerCity }}</p>
                  <p class="font-body text-xs text-gray-500 mt-1">📍 {{ order.buyerAddress }}</p>
                  @if (order.notes) {
                    <p class="font-body text-xs text-gray-500 mt-1 italic">💬 {{ order.notes }}</p>
                  }

                  <!-- Items -->
                  <div class="mt-3 space-y-1">
                    @for (item of order.items; track item.productId) {
                      <div class="flex items-center gap-2 text-xs font-body text-gray-400">
                        <img [src]="item.productImage" class="w-6 h-6 rounded object-cover" />
                        <span>{{ item.productName }}</span>
                        <span class="text-gray-600">×{{ item.quantity }}</span>
                        <span class="text-brand-400">PKR {{ (item.price * item.quantity) | number }}</span>
                      </div>
                    }
                  </div>
                </div>

                <div class="text-right flex flex-col items-end gap-3">
                  <div>
                    <p class="font-display font-bold text-brand-400 text-xl">PKR {{ order.total | number }}</p>
                    <p class="text-xs font-body text-gray-500">{{ order.items.length }} item(s) · COD</p>
                  </div>

                  <!-- Action buttons -->
                  <div class="flex flex-wrap gap-2 justify-end">
                    @if (order.status === 'pending') {
                      <button (click)="updateStatus(order, 'confirmed')"
                        class="px-3 py-1.5 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-body hover:bg-blue-600/40 transition-colors">
                        ✓ Confirm
                      </button>
                      <button (click)="updateStatus(order, 'cancelled')"
                        class="px-3 py-1.5 bg-red-600/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-body hover:bg-red-600/40 transition-colors">
                        ✕ Cancel
                      </button>
                    }
                    @if (order.status === 'confirmed') {
                      <!-- Tracking ID input (optional) -->
                      <div class="flex items-center gap-2 w-full justify-end">
                        <input [(ngModel)]="trackingInputs[order.id]" type="text"
                          placeholder="Tracking ID (optional)"
                          class="px-3 py-1.5 bg-dark-700 border border-white/10 rounded-lg text-xs font-body text-white placeholder-gray-600 outline-none focus:border-purple-500/50 w-44" />
                        <button (click)="updateStatus(order, 'shipped', trackingInputs[order.id])"
                          class="px-3 py-1.5 bg-purple-600/20 text-purple-400 border border-purple-500/30 rounded-lg text-xs font-body hover:bg-purple-600/40 transition-colors whitespace-nowrap">
                          🚚 Mark Shipped
                        </button>
                      </div>
                    }
                    @if (order.status === 'shipped') {
                      @if (order.trackingId) {
                        <div class="flex items-center gap-2 text-xs font-body text-gray-500 w-full justify-end">
                          <span>📦 Tracking:</span>
                          <span class="font-mono text-purple-400">{{ order.trackingId }}</span>
                        </div>
                      }
                      <button (click)="updateStatus(order, 'delivered')"
                        class="px-3 py-1.5 bg-green-600/20 text-green-400 border border-green-500/30 rounded-lg text-xs font-body hover:bg-green-600/40 transition-colors">
                        ✅ Mark Delivered
                      </button>
                    }
                    @if (order.status === 'delivered') {
                      <span class="text-xs font-body text-green-400 flex items-center gap-1">
                        ✅ Delivered
                      </span>
                    }
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

  filter       = signal('All');
  loading      = signal(false);
  orders       = signal<Order[]>([]);
  newOrderIds  = signal<Set<string>>(new Set());
  newOrderAlert = signal(false);
  statuses     = ['All', 'Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];
  trackingInputs: Record<string, string> = {};

  private pollInterval: ReturnType<typeof setInterval> | null = null;
  private lastKnownCount = 0;

  pendingCount = computed(() =>
    this.orders().filter(o => o.status === 'pending').length
  );

  filteredOrders = computed(() => {
    const f = this.filter().toLowerCase();
    if (f === 'all') return this.orders();
    return this.orders().filter(o => o.status === f);
  });

  countByStatus(status: string): number {
    return this.orders().filter(o => o.status === status.toLowerCase()).length;
  }

  isNew(orderId: string): boolean {
    return this.newOrderIds().has(orderId);
  }

  ngOnInit() {
    this.loadOrders();
    // Poll every 30 seconds for new orders
    this.pollInterval = setInterval(() => this.pollForNewOrders(), 30_000);
  }

  ngOnDestroy() {
    if (this.pollInterval) clearInterval(this.pollInterval);
  }

  loadOrders() {
    this.loading.set(true);
    this.orderService.getOrders().subscribe({
      next: (orders) => {
        this.lastKnownCount = orders.length;
        this.orders.set(orders);
        this.loading.set(false);
      },
      error: () => {
        this.orders.set(this.mockOrders);
        this.loading.set(false);
      }
    });
  }

  private pollForNewOrders() {
    this.orderService.getOrderCount().subscribe({
      next: ({ total, pending }) => {
        if (total > this.lastKnownCount) {
          // New orders arrived — reload and highlight them
          const prevIds = new Set(this.orders().map(o => o.id));
          this.orderService.getOrders().subscribe({
            next: (orders) => {
              this.lastKnownCount = orders.length;
              const freshIds = new Set(
                orders.filter(o => !prevIds.has(o.id)).map(o => o.id)
              );
              if (freshIds.size > 0) {
                this.newOrderIds.set(freshIds);
                this.newOrderAlert.set(true);
                // Clear alert banner after 10 seconds
                setTimeout(() => {
                  this.newOrderAlert.set(false);
                  this.newOrderIds.set(new Set());
                }, 10_000);
              }
              this.orders.set(orders);
            }
          });
        }
      }
    });
  }

  updateStatus(order: Order, status: Order['status'], trackingId?: string) {
    this.orderService.updateOrderStatus(order.id, status, trackingId).subscribe({
      next: (updated) => {
        this.orders.update(list => list.map(o => o.id === updated.id ? updated : o));
      },
      error: () => {
        this.orders.update(list => list.map(o => o.id === order.id ? { ...o, status } : o));
      }
    });
  }

  private mockOrders: Order[] = [
    {
      id: 'GM-001',
      buyerName: 'Ayesha Siddiqui',
      buyerPhone: '0312-3456789',
      buyerCity: 'Karachi',
      buyerAddress: 'House 12, Block 5, Gulshan-e-Iqbal',
      items: [{ productId: '1', productName: 'HydraFusion Night Cream', productImage: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400', quantity: 2, price: 2200 }],
      total: 4400,
      status: 'pending',
      paymentMethod: 'cod',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'GM-002',
      buyerName: 'Sara Ahmed',
      buyerPhone: '0321-9876543',
      buyerCity: 'Lahore',
      buyerAddress: 'Flat 3B, DHA Phase 4',
      items: [{ productId: '2', productName: 'Velvet Rose Lipstick', productImage: 'https://images.unsplash.com/photo-1586495777744-4e6232bf9f06?w=400', quantity: 1, price: 950 }],
      total: 950,
      status: 'confirmed',
      paymentMethod: 'cod',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'GM-003',
      buyerName: 'Zara Malik',
      buyerPhone: '0333-1122334',
      buyerCity: 'Islamabad',
      buyerAddress: 'F-7/2, Street 14',
      items: [{ productId: '3', productName: 'Glow Serum Pro', productImage: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400', quantity: 1, price: 2800 }],
      total: 2800,
      status: 'shipped',
      paymentMethod: 'cod',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
}
