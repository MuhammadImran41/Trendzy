import { Component, Input, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Product } from '../../models/product.model';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <div class="glass-card card-hover group relative flex flex-col overflow-hidden">

      <!-- Image -->
      <a [routerLink]="['/product', product.id]" class="block relative overflow-hidden"
         style="aspect-ratio:1/1;">
        <img [src]="product.images[0]" [alt]="product.name"
             class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />

        <!-- Overlay on hover -->
        <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent
                    opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        <!-- Category pill -->
        <span class="absolute top-3 left-3 badge badge-brand text-xs">
          {{ product.category }}
        </span>

        <!-- Discount badge -->
        @if (discount > 0) {
          <span class="absolute top-3 right-3 badge badge-green text-xs">
            {{ discount }}% OFF
          </span>
        }

        <!-- Quick add overlay -->
        <div class="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100
                    transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <button (click)="addToCart($event)"
            class="w-full py-2.5 bg-brand-500 hover:bg-brand-400 rounded-xl
                   text-white text-sm font-body font-semibold
                   transition-all active:scale-95 flex items-center justify-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
            Add to Cart
          </button>
        </div>
      </a>

      <!-- Info -->
      <div class="flex flex-col flex-1 p-4 gap-2">
        <a [routerLink]="['/product', product.id]" class="flex-1">
          <h3 class="font-display text-sm font-semibold text-white leading-snug
                     line-clamp-2 group-hover:text-brand-300 transition-colors duration-200">
            {{ product.name }}
          </h3>
          <p class="text-gray-500 text-xs font-body line-clamp-2 mt-1 leading-relaxed">
            {{ product.description }}
          </p>
        </a>

        <!-- Stock indicator -->
        <div class="flex items-center gap-1.5">
          @if (product.stock > 10) {
            <span class="w-1.5 h-1.5 rounded-full bg-green-400"></span>
            <span class="text-xs text-green-400 font-body">In Stock</span>
          } @else if (product.stock > 0) {
            <span class="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
            <span class="text-xs text-yellow-400 font-body">Only {{ product.stock }} left</span>
          } @else {
            <span class="w-1.5 h-1.5 rounded-full bg-red-400"></span>
            <span class="text-xs text-red-400 font-body">Out of Stock</span>
          }
        </div>

        <!-- Price row -->
        <div class="flex items-center justify-between mt-1">
          <div class="flex items-baseline gap-2">
            <span class="text-brand-400 font-body font-bold text-lg leading-none">
              PKR {{ product.sellerPrice | number }}
            </span>
            @if (product.originalPrice > product.sellerPrice) {
              <span class="text-gray-600 text-xs line-through font-body">
                {{ product.originalPrice | number }}
              </span>
            }
          </div>

          <!-- Mobile add button (always visible) -->
          <button (click)="addToCart($event)"
            [class.opacity-50]="added()"
            class="md:hidden flex items-center gap-1 px-3 py-2 bg-brand-600 hover:bg-brand-500
                   rounded-xl text-xs font-body font-semibold text-white
                   transition-all active:scale-95">
            @if (added()) { ✓ Added } @else {
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              Add
            }
          </button>
        </div>
      </div>

      <!-- Added flash -->
      @if (added()) {
        <div class="absolute inset-0 bg-brand-500/10 border border-brand-500/30 rounded-[1.25rem]
                    pointer-events-none animate-fade-in"></div>
      }
    </div>
  `
})
export class ProductCardComponent {
  @Input() product!: Product;
  private cartService = inject(CartService);
  added = signal(false);

  get discount(): number {
    if (!this.product.originalPrice || this.product.originalPrice <= this.product.sellerPrice) return 0;
    return Math.round((1 - this.product.sellerPrice / this.product.originalPrice) * 100);
  }

  addToCart(e: Event) {
    e.preventDefault();
    e.stopPropagation();
    if (this.product.stock === 0) return;
    this.cartService.addToCart(this.product);
    this.added.set(true);
    setTimeout(() => this.added.set(false), 1500);
  }
}
