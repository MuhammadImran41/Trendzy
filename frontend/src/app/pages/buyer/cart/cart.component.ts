import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, CommonModule],
  styles: [`
    .page { max-width: 900px; margin: 0 auto; padding: 142px 2rem 4rem; }

    @media (max-width: 600px) {
      .page { padding: 2rem 1rem; }
      .page-title { font-size: 1.75rem; }
      .cart-item { flex-wrap: wrap; gap: 1rem; }
      .item-img { width: 70px; height: 70px; }
      .item-total { min-width: unset; text-align: left; width: 100%; }
      .qty-ctrl { margin-left: auto; }
      .summary { padding: 1.25rem; }
      .checkout-btn { padding: 0.875rem; font-size: 0.75rem; }
    }
    @media (max-width: 480px) {
      .cart-item { gap: 0.75rem; }
      .item-img { width: 60px; height: 60px; flex-shrink: 0; }
      .remove-btn { margin-left: auto; }
    }

    .page-title {
      font-family: 'DM Serif Display', Georgia, serif;
      font-size: 2.5rem; font-weight: 400; color: #1a1410;
      margin-bottom: 0.375rem;
    }
    .page-sub {
      font-family: 'Inter', sans-serif; font-size: 0.8rem;
      color: #9e9890; letter-spacing: 0.05em; margin-bottom: 2.5rem;
    }

    .empty-state {
      text-align: center;
      padding: 5rem 2rem;
      border: 1px solid #e8e0d6;
      background: #faf7f4;
    }
    .empty-icon { display:flex; justify-content:center; margin-bottom: 1rem; }
    .empty-text {
      font-family: 'DM Serif Display', serif;
      font-size: 1.5rem; color: #6b6560; margin-bottom: 1.5rem;
    }

    .cart-item {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      padding: 1.5rem 0;
      border-bottom: 1px solid #f0ebe4;
    }
    .item-img {
      width: 90px; height: 90px;
      object-fit: cover;
      flex-shrink: 0;
      background: #f5f0e8;
    }
    .item-name {
      font-family: 'DM Serif Display', serif;
      font-size: 1.1rem; font-weight: 500; color: #1a1410;
      margin-bottom: 0.25rem;
    }
    .item-price {
      font-family: 'Inter', sans-serif;
      font-size: 0.85rem; color: #9e9890;
    }

    .qty-ctrl {
      display: flex; align-items: center;
      border: 1px solid #ddd8d0;
    }
    .qty-btn {
      width: 36px; height: 36px;
      display: flex; align-items: center; justify-content: center;
      background: none; border: none; cursor: pointer;
      font-size: 1.1rem; color: #6b6560;
      transition: background 0.2s, color 0.2s;
    }
    .qty-btn:hover { background: #f5f0e8; color: #1a1410; }
    .qty-num {
      width: 36px; text-align: center;
      font-family: 'Inter', sans-serif; font-size: 0.875rem; color: #1a1410;
    }

    .item-total {
      font-family: 'DM Serif Display', serif;
      font-size: 1.1rem; font-weight: 600; color: #1a1410;
      min-width: 100px; text-align: right;
    }
    .remove-btn {
      background: none; border: none; cursor: pointer;
      color: #b0a898; font-size: 1rem;
      transition: color 0.2s; padding: 0.25rem;
    }
    .remove-btn:hover { color: #dc2626; }

    .summary {
      margin-top: 2rem;
      border: 1px solid #e8e0d6;
      padding: 2rem;
      background: #faf7f4;
    }
    .summary-row {
      display: flex; justify-content: space-between;
      font-family: 'Inter', sans-serif; font-size: 0.875rem;
      color: #6b6560; margin-bottom: 0.875rem;
    }
    .summary-total {
      display: flex; justify-content: space-between; align-items: baseline;
      padding-top: 1rem; border-top: 1px solid #e8e0d6; margin-top: 0.5rem;
    }
    .total-label {
      font-family: 'DM Serif Display', serif;
      font-size: 1.25rem; font-weight: 500; color: #1a1410;
    }
    .total-amount {
      font-family: 'DM Serif Display', serif;
      font-size: 1.75rem; font-weight: 600; color: #1a1410;
    }
    .checkout-btn {
      display: block; width: 100%;
      margin-top: 1.5rem;
      padding: 1rem;
      background: #1a1410; color: #faf7f4;
      font-family: 'Inter', sans-serif; font-size: 0.8rem;
      font-weight: 500; letter-spacing: 0.15em; text-transform: uppercase;
      text-align: center; text-decoration: none;
      transition: background 0.2s;
    }
    .checkout-btn:hover { background: #2d2520; }
  `],
  template: `
    <div class="page">
      <h1 class="page-title">Your Bag</h1>
      <p class="page-sub">{{ cart.items().length }} item{{ cart.items().length !== 1 ? 's' : '' }}</p>

      @if (cart.items().length === 0) {
        <div class="empty-state">
          <div class="empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ddd8d0" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
            </svg>
          </div>
          <div class="empty-text">Your bag is empty</div>
          <a routerLink="/products" class="btn-primary" style="display:inline-flex;">Browse Products</a>
        </div>
      } @else {
        <div>
          @for (item of cart.items(); track item.product.id) {
            <div class="cart-item">
              <img [src]="item.product.images[0]" [alt]="item.product.name" class="item-img" />
              <div style="flex:1;min-width:0;">
                <div class="item-name">{{ item.product.name }}</div>
                <div class="item-price">PKR {{ item.product.sellerPrice | number }} each</div>
              </div>
              <div class="qty-ctrl">
                <button class="qty-btn" (click)="cart.updateQuantity(item.product.id, item.quantity - 1)">−</button>
                <span class="qty-num">{{ item.quantity }}</span>
                <button class="qty-btn" (click)="cart.updateQuantity(item.product.id, item.quantity + 1)">+</button>
              </div>
              <div class="item-total">PKR {{ (item.product.sellerPrice * item.quantity) | number }}</div>
              <button class="remove-btn" (click)="cart.removeFromCart(item.product.id)">✕</button>
            </div>
          }
        </div>

        <div class="summary">
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
          <a routerLink="/checkout" class="checkout-btn">Proceed to Checkout</a>
        </div>
      }
    </div>
  `
})
export class CartComponent {
  cart = inject(CartService);
}
