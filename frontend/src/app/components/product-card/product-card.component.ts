import { Component, Input, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Product } from '../../models/product.model';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink, CommonModule],
  styles: [`
    .card {
      background: #fff;
      border: 1px solid #ede8e0;
      display: flex;
      flex-direction: column;
      transition: box-shadow 0.3s ease, transform 0.3s ease;
      position: relative;
    }
    .card:hover {
      box-shadow: 0 16px 48px rgba(26,20,16,0.1);
      transform: translateY(-4px);
    }

    .img-wrap {
      position: relative;
      overflow: hidden;
      aspect-ratio: 1/1;
      background: #f5f0e8;
    }
    .img-wrap img {
      width: 100%; height: 100%;
      object-fit: cover;
      object-position: center top;
      transition: transform 0.6s ease;
      image-rendering: -webkit-optimize-contrast;
      image-rendering: crisp-edges;
    }
    .card:hover .img-wrap img { transform: scale(1.06); }

    .overlay {
      position: absolute;
      inset: 0;
      background: rgba(26,20,16,0.35);
      opacity: 0;
      transition: opacity 0.3s;
      display: flex;
      align-items: flex-end;
      padding: 1rem;
    }
    .card:hover .overlay { opacity: 1; }

    .quick-add {
      width: 100%;
      padding: 0.75rem;
      background: #faf7f4;
      color: #1a1410;
      font-family: 'Inter', sans-serif;
      font-size: 0.72rem;
      font-weight: 500;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      border: none;
      cursor: pointer;
      transition: background 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }
    .quick-add:hover { background: #fff; }

    .cat-pill {
      position: absolute;
      top: 0.75rem;
      left: 0.75rem;
      background: rgba(250,247,244,0.92);
      font-family: 'Inter', sans-serif;
      font-size: 0.62rem;
      font-weight: 500;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #6b6560;
      padding: 0.25rem 0.625rem;
    }
    .discount-pill {
      position: absolute;
      top: 0.75rem;
      right: 0.75rem;
      background: #1a1410;
      color: #c9a96e;
      font-family: 'Inter', sans-serif;
      font-size: 0.62rem;
      font-weight: 600;
      letter-spacing: 0.08em;
      padding: 0.25rem 0.625rem;
    }

    .info { padding: 1.25rem; flex: 1; display: flex; flex-direction: column; gap: 0.5rem; }

    .product-name {
      font-family: 'DM Serif Display', Georgia, serif;
      font-size: 1.05rem;
      font-weight: 500;
      color: #1a1410;
      line-height: 1.3;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-decoration: none;
    }
    .product-name:hover { color: #8b6914; }

    .product-desc {
      font-family: 'Inter', sans-serif;
      font-size: 0.78rem;
      color: #9e9890;
      line-height: 1.6;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .stock-row {
      display: flex;
      align-items: center;
      gap: 0.375rem;
    }
    .stock-dot { width: 6px; height: 6px; border-radius: 50%; }

    .price-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: auto;
      padding-top: 0.75rem;
      border-top: 1px solid #f0ebe4;
    }
    .price-main {
      font-family: 'DM Serif Display', serif;
      font-size: 1.3rem;
      font-weight: 600;
      color: #1a1410;
    }
    .price-orig {
      font-family: 'Inter', sans-serif;
      font-size: 0.78rem;
      color: #b0a898;
      text-decoration: line-through;
      margin-left: 0.375rem;
    }

    .add-btn-mobile {
      display: none;
      padding: 0.4rem 0.875rem;
      background: #1a1410;
      color: #faf7f4;
      font-family: 'Inter', sans-serif;
      font-size: 0.7rem;
      font-weight: 500;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      border: none;
      cursor: pointer;
      transition: background 0.2s;
    }
    .add-btn-mobile:hover { background: #2d2520; }

    @media (max-width: 768px) {
      .add-btn-mobile { display: block; }
    }

    .added-flash {
      position: absolute;
      inset: 0;
      border: 2px solid #c9a96e;
      pointer-events: none;
      animation: fadeIn 0.2s ease;
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `],
  template: `
    <div class="card">
      <!-- Image -->
      <a [routerLink]="['/product', product.id]" class="img-wrap">
        <img [src]="product.images[0]" [alt]="product.name"
             loading="lazy" decoding="async"
             onerror="this.src='https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=85&fit=crop'" />

        <span class="cat-pill">{{ product.category }}</span>

        @if (discount > 0) {
          <span class="discount-pill">−{{ discount }}%</span>
        }

        <div class="overlay">
          <button (click)="addToCart($event)" class="quick-add">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
            </svg>
            Add to Bag
          </button>
        </div>
      </a>

      <!-- Info -->
      <div class="info">
        <a [routerLink]="['/product', product.id]" class="product-name">{{ product.name }}</a>
        <p class="product-desc">{{ product.description }}</p>

        <div class="stock-row">
          @if (product.stock > 10) {
            <span class="stock-dot" style="background:#16a34a;"></span>
            <span style="font-family:'Inter', sans-serif;font-size:0.72rem;color:#16a34a;letter-spacing:0.05em;">In Stock</span>
          } @else if (product.stock > 0) {
            <span class="stock-dot" style="background:#d97706;"></span>
            <span style="font-family:'Inter', sans-serif;font-size:0.72rem;color:#d97706;letter-spacing:0.05em;">Only {{ product.stock }} left</span>
          } @else {
            <span class="stock-dot" style="background:#dc2626;"></span>
            <span style="font-family:'Inter', sans-serif;font-size:0.72rem;color:#dc2626;letter-spacing:0.05em;">Out of Stock</span>
          }
        </div>

        <div class="price-row">
          <div>
            <span class="price-main">PKR {{ product.sellerPrice | number }}</span>
            @if (product.originalPrice > product.sellerPrice) {
              <span class="price-orig">{{ product.originalPrice | number }}</span>
            }
          </div>
          <button (click)="addToCart($event)" class="add-btn-mobile"
                  [disabled]="product.stock === 0">
            @if (added()) {
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              Added
            } @else { + Add }
          </button>
        </div>
      </div>

      @if (added()) {
        <div class="added-flash"></div>
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
