import { Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 class="font-display text-3xl font-bold text-white mb-8">Your Cart</h1>

      @if (cart.items().length === 0) {
        <div class="text-center py-20 glass rounded-2xl">
          <p class="text-5xl mb-4">🛒</p>
          <p class="text-gray-400 font-body mb-6">Your cart is empty</p>
          <a routerLink="/products" class="px-6 py-3 bg-brand-600 hover:bg-brand-500 rounded-xl font-body font-medium text-white transition-all">
            Browse Products
          </a>
        </div>
      } @else {
        <div class="space-y-4 mb-8">
          @for (item of cart.items(); track item.product.id) {
            <div class="glass rounded-2xl p-4 flex items-center gap-4">
              <img [src]="item.product.images[0]" [alt]="item.product.name"
                   class="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
              <div class="flex-1 min-w-0">
                <h3 class="font-display font-semibold text-white truncate">{{ item.product.name }}</h3>
                <p class="text-brand-400 font-body font-bold">PKR {{ item.product.sellerPrice | number }}</p>
              </div>
              <div class="flex items-center gap-2 glass rounded-xl px-1">
                <button (click)="cart.updateQuantity(item.product.id, item.quantity - 1)"
                  class="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white">−</button>
                <span class="w-6 text-center text-sm font-body text-white">{{ item.quantity }}</span>
                <button (click)="cart.updateQuantity(item.product.id, item.quantity + 1)"
                  class="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white">+</button>
              </div>
              <span class="font-body font-semibold text-white w-24 text-right">
                PKR {{ (item.product.sellerPrice * item.quantity) | number }}
              </span>
              <button (click)="cart.removeFromCart(item.product.id)"
                class="text-gray-500 hover:text-red-400 transition-colors ml-2">✕</button>
            </div>
          }
        </div>

        <!-- Summary -->
        <div class="glass rounded-2xl p-6">
          <div class="flex justify-between items-center mb-2 font-body text-gray-400">
            <span>Subtotal</span>
            <span>PKR {{ cart.totalPrice() | number }}</span>
          </div>
          <div class="flex justify-between items-center mb-2 font-body text-gray-400">
            <span>Delivery</span>
            <span class="text-green-400">Free</span>
          </div>
          <div class="border-t border-white/5 my-4"></div>
          <div class="flex justify-between items-center mb-6">
            <span class="font-display text-lg font-bold text-white">Total</span>
            <span class="font-display text-2xl font-bold text-brand-400">PKR {{ cart.totalPrice() | number }}</span>
          </div>
          <a routerLink="/checkout"
            class="block w-full py-4 bg-brand-600 hover:bg-brand-500 rounded-2xl font-body font-semibold text-white text-center transition-all hover:shadow-xl hover:shadow-brand-500/30">
            Proceed to Checkout →
          </a>
        </div>
      }
    </div>
  `
})
export class CartComponent {
  cart = inject(CartService);
}
