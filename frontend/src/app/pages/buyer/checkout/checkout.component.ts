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
  styles: [`
    .page {
      max-width: 1100px;
      margin: 0 auto;
      padding: 4rem 2rem;
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 3rem;
      align-items: flex-start;
    }
    @media (max-width: 900px) {
      .page { grid-template-columns: 1fr; }
      .summary-col { order: -1; }
    }

    /* ── Left: Form ── */
    .page-eyebrow {
      font-family: 'Jost', sans-serif;
      font-size: 0.65rem; font-weight: 600;
      letter-spacing: 0.25em; text-transform: uppercase;
      color: #c9a96e; margin-bottom: 0.5rem;
    }
    .page-title {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 2.25rem; font-weight: 400; color: #1a1410;
      margin-bottom: 0.25rem;
    }
    .page-sub {
      font-family: 'Jost', sans-serif;
      font-size: 0.82rem; color: #9e9890;
      margin-bottom: 2.5rem;
    }
    .gold-line {
      height: 1px;
      background: linear-gradient(90deg, #c9a96e, transparent);
      width: 40px; margin-bottom: 2.5rem;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.25rem;
    }
    @media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } }

    .field { display: flex; flex-direction: column; }
    .field.full { grid-column: 1 / -1; }

    .field-label {
      font-family: 'Jost', sans-serif;
      font-size: 0.62rem; font-weight: 600;
      letter-spacing: 0.15em; text-transform: uppercase;
      color: #9e9890; margin-bottom: 0.5rem;
    }
    .field-input {
      background: #fff;
      border: 1px solid #ddd8d0;
      padding: 0.75rem 1rem;
      font-family: 'Jost', sans-serif;
      font-size: 0.875rem; color: #1a1410;
      outline: none; transition: border-color 0.2s;
      width: 100%;
    }
    .field-input::placeholder { color: #b0a898; }
    .field-input:focus { border-color: #c9a96e; }
    textarea.field-input { resize: none; }

    .cod-notice {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 1.25rem;
      background: #f5f0e8;
      border: 1px solid #e8e0d6;
      margin: 1.5rem 0;
    }
    .cod-text {
      font-family: 'Jost', sans-serif;
      font-size: 0.82rem; color: #6b6560;
    }
    .cod-text strong { color: #1a1410; font-weight: 500; }

    .error-box {
      padding: 0.875rem 1rem;
      background: rgba(220,38,38,0.06);
      border: 1px solid rgba(220,38,38,0.2);
      font-family: 'Jost', sans-serif;
      font-size: 0.82rem; color: #dc2626;
      margin-bottom: 1.25rem;
      display: flex; align-items: center; gap: 0.5rem;
    }

    .submit-btn {
      width: 100%;
      padding: 1rem;
      background: #1a1410;
      color: #faf7f4;
      font-family: 'Jost', sans-serif;
      font-size: 0.8rem; font-weight: 500;
      letter-spacing: 0.15em; text-transform: uppercase;
      border: none; cursor: pointer;
      transition: background 0.2s;
      display: flex; align-items: center; justify-content: center; gap: 0.625rem;
    }
    .submit-btn:hover:not(:disabled) { background: #2d2520; }
    .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    /* ── Right: Summary ── */
    .summary-col {
      position: sticky;
      top: 100px;
    }
    .summary-box {
      background: #fff;
      border: 1px solid #e8e0d6;
    }
    .summary-header {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid #e8e0d6;
      background: #f5f0e8;
    }
    .summary-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 1.1rem; font-weight: 500; color: #1a1410;
    }
    .summary-body { padding: 1.25rem 1.5rem; }

    .summary-item {
      display: flex;
      align-items: center;
      gap: 0.875rem;
      padding: 0.75rem 0;
      border-bottom: 1px solid #f5f0e8;
    }
    .summary-item:last-child { border-bottom: none; }
    .item-img {
      width: 48px; height: 48px;
      object-fit: cover;
      background: #f5f0e8;
      flex-shrink: 0;
    }
    .item-name {
      font-family: 'Jost', sans-serif;
      font-size: 0.82rem; font-weight: 500; color: #1a1410;
      flex: 1; min-width: 0;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .item-qty {
      font-family: 'Jost', sans-serif;
      font-size: 0.72rem; color: #9e9890;
    }
    .item-price {
      font-family: 'Cormorant Garamond', serif;
      font-size: 1rem; font-weight: 600; color: #1a1410;
      white-space: nowrap;
    }

    .summary-footer {
      padding: 1.25rem 1.5rem;
      border-top: 1px solid #e8e0d6;
      background: #f5f0e8;
    }
    .summary-row {
      display: flex; justify-content: space-between;
      font-family: 'Jost', sans-serif;
      font-size: 0.82rem; color: #9e9890;
      margin-bottom: 0.5rem;
    }
    .summary-total {
      display: flex; justify-content: space-between; align-items: baseline;
      padding-top: 0.75rem;
      border-top: 1px solid #ddd8d0;
      margin-top: 0.25rem;
    }
    .total-label {
      font-family: 'Cormorant Garamond', serif;
      font-size: 1.1rem; font-weight: 500; color: #1a1410;
    }
    .total-amount {
      font-family: 'Cormorant Garamond', serif;
      font-size: 1.5rem; font-weight: 600; color: #1a1410;
    }

    @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  `],
  template: `
    <div class="page">

      <!-- Left: Form -->
      <div>
        <div class="page-eyebrow">Delivery Details</div>
        <h1 class="page-title">Checkout</h1>
        <p class="page-sub">No account needed — fill in your details and we'll deliver!</p>
        <div class="gold-line"></div>

        <div class="form-grid">
          <div class="field">
            <label class="field-label">Full Name *</label>
            <input class="field-input" [(ngModel)]="form.name" type="text" placeholder="e.g. Fatima Khan" />
          </div>

          <div class="field">
            <label class="field-label">Phone Number *</label>
            <input class="field-input" [(ngModel)]="form.phone" type="tel" placeholder="03XX-XXXXXXX" />
          </div>

          <div class="field">
            <label class="field-label">City *</label>
            <input class="field-input" [(ngModel)]="form.city" type="text" placeholder="e.g. Karachi, Lahore" />
          </div>

          <div class="field">
            <label class="field-label">Notes (optional)</label>
            <input class="field-input" [(ngModel)]="form.notes" type="text" placeholder="Special instructions..." />
          </div>

          <div class="field full">
            <label class="field-label">Delivery Address *</label>
            <textarea class="field-input" [(ngModel)]="form.address" rows="3"
              placeholder="House/Flat no., Street, Area, City"></textarea>
          </div>
        </div>

        <!-- COD notice -->
        <div class="cod-notice">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c9a96e" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
          </svg>
          <span class="cod-text">
            <strong>Cash on Delivery</strong> — Pay when your order arrives at your door. No advance payment required.
          </span>
        </div>

        @if (error()) {
          <div class="error-box">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {{ error() }}
          </div>
        }

        <button class="submit-btn" (click)="placeOrder()" [disabled]="loading()">
          @if (loading()) {
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation:spin 1s linear infinite;">
              <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
            </svg>
            Placing Order...
          } @else {
            Place Order — Cash on Delivery
          }
        </button>
      </div>

      <!-- Right: Order Summary -->
      <div class="summary-col">
        <div class="summary-box">
          <div class="summary-header">
            <div class="summary-title">Order Summary</div>
          </div>
          <div class="summary-body">
            @for (item of cart.items(); track item.product.id) {
              <div class="summary-item">
                <img [src]="item.product.images[0]" [alt]="item.product.name" class="item-img" />
                <div style="flex:1;min-width:0;">
                  <div class="item-name">{{ item.product.name }}</div>
                  <div class="item-qty">Qty: {{ item.quantity }}</div>
                </div>
                <div class="item-price">PKR {{ (item.product.sellerPrice * item.quantity) | number }}</div>
              </div>
            }
          </div>
          <div class="summary-footer">
            <div class="summary-row">
              <span>Subtotal</span>
              <span>PKR {{ cart.totalPrice() | number }}</span>
            </div>
            <div class="summary-row">
              <span>Delivery</span>
              <span style="color:#16a34a;">Free</span>
            </div>
            <div class="summary-total">
              <span class="total-label">Total</span>
              <span class="total-amount">PKR {{ cart.totalPrice() | number }}</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  `
})
export class CheckoutComponent {
  cart               = inject(CartService);
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
      next: (placed) => {
        this.cart.clearCart();
        this.router.navigate(['/order-success'], { queryParams: { id: placed.id } });
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        if (err.status === 0) {
          this.error.set('Server is waking up. Please wait 10 seconds and try again.');
        } else {
          this.error.set(`Order failed (${err.status}). Please try again.`);
        }
      },
    });
  }
}
