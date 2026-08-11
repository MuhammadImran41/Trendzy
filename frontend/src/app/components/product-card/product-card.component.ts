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
    /* ── Card wrapper ── */
    .card {
      background: #fff;
      border-radius: 16px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      position: relative;
      transition: box-shadow 0.35s ease, transform 0.35s ease;
      box-shadow: 0 2px 12px rgba(26,20,16,0.06);
    }
    .card:hover {
      box-shadow: 0 20px 56px rgba(26,20,16,0.14);
      transform: translateY(-6px);
    }

    /* ── Image area ── */
    .img-wrap {
      position: relative;
      overflow: hidden;
      aspect-ratio: 4/5;
      background: #f5f0e8;
      display: block;
    }
    .img-wrap img {
      width: 100%; height: 100%;
      object-fit: cover;
      object-position: center top;
      transition: transform 0.65s cubic-bezier(0.25,0.46,0.45,0.94);
    }
    .card:hover .img-wrap img { transform: scale(1.08); }

    /* gradient overlay on hover */
    .img-wrap::after {
      content: '';
      position: absolute; inset: 0;
      background: linear-gradient(to top, rgba(26,20,16,0.55) 0%, rgba(26,20,16,0.1) 45%, transparent 70%);
      opacity: 0;
      transition: opacity 0.35s ease;
    }
    .card:hover .img-wrap::after { opacity: 1; }

    /* ── Badges ── */
    .badge-cat {
      position: absolute; top: 12px; left: 12px; z-index: 2;
      background: rgba(255,255,255,0.92);
      backdrop-filter: blur(8px);
      font-family: 'Inter', sans-serif;
      font-size: 0.58rem; font-weight: 600;
      letter-spacing: 0.14em; text-transform: uppercase;
      color: #6b6560;
      padding: 0.3rem 0.7rem;
      border-radius: 99px;
    }
    .badge-discount {
      position: absolute; top: 12px; right: 12px; z-index: 2;
      background: linear-gradient(135deg, #c9a96e, #8b6914);
      color: #fff;
      font-family: 'Inter', sans-serif;
      font-size: 0.62rem; font-weight: 700;
      letter-spacing: 0.04em;
      padding: 0.3rem 0.65rem;
      border-radius: 99px;
    }

    /* ── Hover CTA (desktop) ── */
    .hover-cta {
      position: absolute; bottom: 0; left: 0; right: 0; z-index: 3;
      padding: 1rem;
      transform: translateY(100%);
      transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
    }
    .card:hover .hover-cta { transform: translateY(0); }

    .btn-add {
      width: 100%;
      padding: 0.75rem;
      background: #fff;
      color: #1a1410;
      font-family: 'Inter', sans-serif;
      font-size: 0.72rem; font-weight: 600;
      letter-spacing: 0.14em; text-transform: uppercase;
      border: none; border-radius: 10px;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center; gap: 0.5rem;
      transition: background 0.2s, color 0.2s, box-shadow 0.2s;
      box-shadow: 0 4px 16px rgba(26,20,16,0.15);
    }
    .btn-add:hover { background: #c9a96e; color: #fff; box-shadow: 0 6px 20px rgba(201,169,110,0.5); }
    .btn-add.is-added { background: #16a34a; color: #fff; }

    /* ── Info section ── */
    .info {
      padding: 1rem 1.125rem 1.125rem;
      flex: 1; display: flex; flex-direction: column; gap: 0.375rem;
    }

    .product-name {
      font-family: 'DM Serif Display', Georgia, serif;
      font-size: 1rem; font-weight: 500;
      color: #1a1410; line-height: 1.3;
      text-decoration: none;
      display: -webkit-box;
      -webkit-line-clamp: 2; -webkit-box-orient: vertical;
      overflow: hidden;
      transition: color 0.2s;
    }
    .product-name:hover { color: #c9a96e; }

    /* ── Price row ── */
    .price-row {
      display: flex; align-items: center; justify-content: space-between;
      margin-top: auto; padding-top: 0.625rem;
    }
    .price-main {
      font-family: 'DM Serif Display', serif;
      font-size: 1.2rem; font-weight: 600; color: #1a1410;
    }
    .price-orig {
      font-family: 'Inter', sans-serif;
      font-size: 0.75rem; color: #b0a898;
      text-decoration: line-through; margin-left: 0.35rem;
    }

    /* stock indicator */
    .stock-chip {
      display: inline-flex; align-items: center; gap: 0.3rem;
      font-family: 'Inter', sans-serif; font-size: 0.68rem;
      padding: 0.2rem 0.6rem; border-radius: 99px;
    }
    .chip-in    { background: rgba(22,163,74,0.08);  color: #16a34a; }
    .chip-low   { background: rgba(217,119,6,0.08);  color: #d97706; }
    .chip-out   { background: rgba(220,38,38,0.08);  color: #dc2626; }

    /* ── Mobile add btn ── */
    .btn-add-mobile {
      display: none;
      align-items: center; justify-content: center; gap: 0.35rem;
      padding: 0.45rem 0.875rem;
      background: #1a1410; color: #faf7f4;
      font-family: 'Inter', sans-serif;
      font-size: 0.68rem; font-weight: 600;
      letter-spacing: 0.1em; text-transform: uppercase;
      border: none; border-radius: 8px; cursor: pointer;
      transition: background 0.2s;
      white-space: nowrap;
    }
    .btn-add-mobile.is-added { background: #16a34a; }
    .btn-add-mobile:hover:not(.is-added) { background: #c9a96e; }

    @media (max-width: 768px) {
      .btn-add-mobile { display: flex; }
    }

    /* ── Added flash border ── */
    .added-ring {
      position: absolute; inset: 0; border-radius: 16px;
      border: 2px solid #c9a96e;
      pointer-events: none;
      animation: ringPop 0.3s cubic-bezier(0.34,1.56,0.64,1);
    }
    @keyframes ringPop {
      from { opacity: 0; transform: scale(0.96); }
      to   { opacity: 1; transform: scale(1); }
    }
  `],
  template: `
    <div class="card">

      <!-- Image -->
      <a [routerLink]="['/product', product.id]" class="img-wrap">
        <img [src]="product.images[0]" [alt]="product.name"
             loading="lazy" decoding="async"
             onerror="this.src='https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=85&fit=crop'" />

        <span class="badge-cat">{{ product.category }}</span>

        @if (discount > 0) {
          <span class="badge-discount">−{{ discount }}%</span>
        }

        <!-- Desktop hover CTA -->
        <div class="hover-cta">
          <button (click)="addToCart($event)" class="btn-add" [class.is-added]="added()">
            @if (added()) {
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              Added to Bag!
            } @else {
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
              </svg>
              Add to Bag
            }
          </button>
        </div>
      </a>

      <!-- Info -->
      <div class="info">
        <a [routerLink]="['/product', product.id]" class="product-name">{{ product.name }}</a>

        <!-- Stock chip -->
        @if (product.stock > 10) {
          <span class="stock-chip chip-in">
            <svg width="6" height="6" viewBox="0 0 8 8" fill="currentColor"><circle cx="4" cy="4" r="4"/></svg>
            In Stock
          </span>
        } @else if (product.stock > 0) {
          <span class="stock-chip chip-low">
            <svg width="6" height="6" viewBox="0 0 8 8" fill="currentColor"><circle cx="4" cy="4" r="4"/></svg>
            Only {{ product.stock }} left
          </span>
        } @else {
          <span class="stock-chip chip-out">
            <svg width="6" height="6" viewBox="0 0 8 8" fill="currentColor"><circle cx="4" cy="4" r="4"/></svg>
            Out of Stock
          </span>
        }

        <!-- Price + mobile add -->
        <div class="price-row">
          <div>
            <span class="price-main">PKR {{ product.sellerPrice | number }}</span>
            @if (product.originalPrice > product.sellerPrice) {
              <span class="price-orig">{{ product.originalPrice | number }}</span>
            }
          </div>
          <button (click)="addToCart($event)" class="btn-add-mobile"
                  [class.is-added]="added()"
                  [disabled]="product.stock === 0">
            @if (added()) {
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              Added
            } @else {
              + Add
            }
          </button>
        </div>
      </div>

      @if (added()) {
        <div class="added-ring"></div>
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
    setTimeout(() => this.added.set(false), 1800);
  }
}
