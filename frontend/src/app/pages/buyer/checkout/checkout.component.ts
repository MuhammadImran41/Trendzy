import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { CartService } from '../../../services/cart.service';
import { OrderService } from '../../../services/order.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 class="font-display text-3xl font-bold text-white mb-2">Checkout</h1>
      <p class="text-gray-400 font-body mb-8">No account needed. Fill in your details and we'll deliver!</p>

      <div class="space-y-5">

        <!-- Name -->
        <div class="glass rounded-2xl p-5">
          <label class="block text-sm font-body font-medium text-gray-300 mb-2">Full Name *</label>
          <input [(ngModel)]="form.name" type="text" placeholder="e.g. Fatima Khan"
            class="w-full bg-dark-700 border border-white/10 focus:border-brand-500/60 rounded-xl px-4 py-3 text-white font-body placeholder-gray-600 outline-none transition-colors" />
        </div>

        <!-- Phone -->
        <div class="glass rounded-2xl p-5">
          <label class="block text-sm font-body font-medium text-gray-300 mb-2">Phone Number *</label>
          <input [(ngModel)]="form.phone" type="tel" placeholder="03XX-XXXXXXX"
            class="w-full bg-dark-700 border border-white/10 focus:border-brand-500/60 rounded-xl px-4 py-3 text-white font-body placeholder-gray-600 outline-none transition-colors" />
        </div>

        <!-- City -->
        <div class="glass rounded-2xl p-5">
          <label class="block text-sm font-body font-medium text-gray-300 mb-2">City *</label>
          <input [(ngModel)]="form.city" type="text" placeholder="e.g. Karachi, Lahore, Islamabad"
            class="w-full bg-dark-700 border border-white/10 focus:border-brand-500/60 rounded-xl px-4 py-3 text-white font-body placeholder-gray-600 outline-none transition-colors" />
        </div>

        <!-- Address -->
        <div class="glass rounded-2xl p-5">
          <label class="block text-sm font-body font-medium text-gray-300 mb-2">Delivery Address *</label>
          <textarea [(ngModel)]="form.address" rows="3" placeholder="House/Flat no., Street, Area"
            class="w-full bg-dark-700 border border-white/10 focus:border-brand-500/60 rounded-xl px-4 py-3 text-white font-body placeholder-gray-600 outline-none transition-colors resize-none"></textarea>
        </div>

        <!-- Notes -->
        <div class="glass rounded-2xl p-5">
          <label class="block text-sm font-body font-medium text-gray-300 mb-2">Notes (optional)</label>
          <input [(ngModel)]="form.notes" type="text" placeholder="Any special instructions..."
            class="w-full bg-dark-700 border border-white/10 focus:border-brand-500/60 rounded-xl px-4 py-3 text-white font-body placeholder-gray-600 outline-none transition-colors" />
        </div>

        <!-- Order Summary -->
        <div class="glass rounded-2xl p-5">
          <h3 class="font-body font-semibold text-white mb-4">Order Summary</h3>
          @for (item of cart.items(); track item.product.id) {
            <div class="flex justify-between text-sm font-body text-gray-400 mb-1">
              <span>{{ item.product.name }} × {{ item.quantity }}</span>
              <span>PKR {{ (item.product.sellerPrice * item.quantity) | number }}</span>
            </div>
          }
          <div class="border-t border-white/5 my-3"></div>
          <div class="flex justify-between font-body font-bold text-white">
            <span>Total (COD)</span>
            <span class="text-brand-400">PKR {{ cart.totalPrice() | number }}</span>
          </div>
        </div>

        <!-- Error -->
        @if (error()) {
          <div class="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
            <p class="text-red-400 text-sm font-body text-center">{{ error() }}</p>
          </div>
        }

        <!-- Submit -->
        <button (click)="placeOrder()" [disabled]="loading()"
          class="w-full py-4 bg-brand-600 hover:bg-brand-500 disabled:opacity-60 disabled:cursor-not-allowed
                 rounded-2xl font-body font-semibold text-white text-center transition-all
                 hover:shadow-xl hover:shadow-brand-500/30">
          @if (loading()) {
            <span class="flex items-center justify-center gap-2">
              <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              Placing Order...
            </span>
          } @else {
            Place Order — Cash on Delivery
          }
        </button>

      </div>
    </div>
  `
})
export class CheckoutComponent {
  cart          = inject(CartService);
  private orderService = inject(OrderService);
  private router       = inject(Router);

  form    = { name: '', phone: '', city: '', address: '', notes: '' };
  loading = signal(false);
  error   = signal('');

  placeOrder() {
    if (!this.form.name || !this.form.phone || !this.form.address || !this.form.city) {
      this.error.set('Please fill all required fields.');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    const order = {
      buyerName:    this.form.name,
      buyerPhone:   this.form.phone,
      buyerAddress: this.form.address,
      buyerCity:    this.form.city,
      notes:        this.form.notes,
      items: this.cart.items().map(i => ({
        productId:    i.product.id,
        productName:  i.product.name,
        productImage: i.product.images[0] ?? '',
        quantity:     i.quantity,
        price:        i.product.sellerPrice,
      })),
      total:         this.cart.totalPrice(),
      paymentMethod: 'cod' as const,
    };

    this.orderService.placeOrder(order).subscribe({
      next: (order) => {
        this.cart.clearCart();
        this.router.navigate(['/order-success'], { queryParams: { id: order.id } });
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        if (err.status === 0) {
          this.error.set('Cannot reach server. Make sure the backend is running on port 8001.');
        } else {
          this.error.set(`Order failed (${err.status}). Please try again.`);
        }
        console.error('Order error:', err);
      },
    });
  }
}
