import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ProductService } from '../../../services/product.service';
import { CartService } from '../../../services/cart.service';
import { Product } from '../../../models/product.model';
import { Review } from '../../../models/order.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  styles: [`
    .page { max-width: 1280px; margin: 0 auto; padding: 3rem 2rem 5rem; }

    @media (max-width: 600px) {
      .page { padding: 1.5rem 1rem 3rem; }
      .breadcrumb { margin-bottom: 1.5rem; flex-wrap: wrap; }
      .product-grid { gap: 1.5rem !important; margin-bottom: 2.5rem; }
      .price-block { flex-direction: column; align-items: flex-start; gap: 0.75rem; }
    }

    .breadcrumb {
      display: flex; align-items: center; gap: 0.5rem;
      font-family: 'Inter', sans-serif; font-size: 0.75rem;
      letter-spacing: 0.08em; color: #9e9890;
      margin-bottom: 3rem;
    }
    .breadcrumb a { color: #9e9890; text-decoration: none; transition: color 0.2s; }
    .breadcrumb a:hover { color: #c9a96e; }

    .product-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 5rem;
      margin-bottom: 5rem;
    }
    @media (max-width: 900px) { .product-grid { grid-template-columns: 1fr; gap: 2.5rem; } }

    .img-main {
      aspect-ratio: 1/1;
      overflow: hidden;
      background: #f5f0e8;
      position: relative;
    }
    .img-main img { width: 100%; height: 100%; object-fit: cover; }

    .cat-tag {
      font-family: 'Inter', sans-serif;
      font-size: 0.65rem; font-weight: 500;
      letter-spacing: 0.2em; text-transform: uppercase;
      color: #c9a96e; margin-bottom: 0.875rem;
    }
    .product-title {
      font-family: 'DM Serif Display', Georgia, serif;
      font-size: clamp(1.75rem, 3vw, 2.5rem);
      font-weight: 400; color: #1a1410;
      line-height: 1.15; margin-bottom: 1rem;
    }

    .stars { display: flex; gap: 2px; }
    .star-filled { color: #c9a96e; }
    .star-empty  { color: #ddd8d0; }

    .price-block {
      background: #f5f0e8;
      border: 1px solid #e8e0d6;
      padding: 1.5rem;
      margin: 1.5rem 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .price-main {
      font-family: 'DM Serif Display', serif;
      font-size: 2rem; font-weight: 600; color: #1a1410;
    }
    .price-orig {
      font-family: 'Inter', sans-serif;
      font-size: 0.9rem; color: #b0a898;
      text-decoration: line-through; margin-left: 0.5rem;
    }

    .stock-row {
      display: flex; align-items: center; gap: 0.5rem;
      margin-bottom: 1.5rem;
      font-family: 'Inter', sans-serif; font-size: 0.8rem;
    }
    .stock-dot { width: 7px; height: 7px; border-radius: 50%; }

    .qty-row {
      display: flex; align-items: center; gap: 1.5rem;
      margin-bottom: 1.5rem;
    }
    .qty-label {
      font-family: 'Inter', sans-serif; font-size: 0.75rem;
      letter-spacing: 0.1em; text-transform: uppercase; color: #9e9890;
      width: 70px;
    }
    .qty-ctrl { display: flex; align-items: center; border: 1px solid #ddd8d0; }
    .qty-btn {
      width: 40px; height: 40px;
      display: flex; align-items: center; justify-content: center;
      background: none; border: none; cursor: pointer;
      font-size: 1.1rem; color: #6b6560; transition: background 0.2s;
    }
    .qty-btn:hover { background: #f5f0e8; }
    .qty-num {
      width: 40px; text-align: center;
      font-family: 'Inter', sans-serif; font-size: 0.9rem; color: #1a1410;
    }

    .cta-row { display: flex; gap: 1rem; }

    .tags { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 1.5rem; }
    .tag {
      padding: 0.25rem 0.75rem;
      border: 1px solid #e8e0d6;
      font-family: 'Inter', sans-serif; font-size: 0.72rem;
      color: #9e9890; letter-spacing: 0.05em;
    }

    /* Reviews */
    .reviews-section { max-width: 800px; }
    .reviews-title {
      font-family: 'DM Serif Display', serif;
      font-size: 1.75rem; font-weight: 400; color: #1a1410;
      margin-bottom: 0.375rem;
    }
    .reviews-sub {
      font-family: 'Inter', sans-serif; font-size: 0.8rem;
      color: #9e9890; margin-bottom: 2rem;
    }

    .rating-summary {
      display: flex; gap: 3rem; align-items: center;
      padding: 2rem; background: #f5f0e8;
      border: 1px solid #e8e0d6; margin-bottom: 1.5rem;
    }
    .rating-big {
      font-family: 'DM Serif Display', serif;
      font-size: 3.5rem; font-weight: 600; color: #1a1410;
      line-height: 1; text-align: center;
    }
    .rating-bar-row { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.375rem; }
    .rating-bar-track { flex: 1; height: 4px; background: #e8e0d6; }
    .rating-bar-fill { height: 100%; background: #c9a96e; transition: width 0.3s; }

    .review-card {
      padding: 1.5rem 0;
      border-bottom: 1px solid #f0ebe4;
    }
    .reviewer-name {
      font-family: 'DM Serif Display', serif;
      font-size: 1rem; font-weight: 500; color: #1a1410;
    }
    .review-text {
      font-family: 'Inter', sans-serif; font-size: 0.875rem;
      color: #6b6560; line-height: 1.7; margin-top: 0.75rem;
    }
    .verified-badge {
      font-family: 'Inter', sans-serif; font-size: 0.65rem;
      letter-spacing: 0.1em; text-transform: uppercase;
      color: #16a34a; background: rgba(22,163,74,0.08);
      border: 1px solid rgba(22,163,74,0.2);
      padding: 0.2rem 0.5rem;
    }
  `],
  template: `
    <div class="page">
      @if (product()) {
        <nav class="breadcrumb">
          <a routerLink="/">Home</a>
          <span>›</span>
          <a routerLink="/products">Products</a>
          <span>›</span>
          <span style="color:#1a1410;">{{ product()!.name }}</span>
        </nav>

        <div class="product-grid">
          <!-- Image -->
          <div>
            <div class="img-main">
              <img [src]="product()!.images[0]" [alt]="product()!.name" />
              @if (discount() > 0) {
                <div style="position:absolute;top:1rem;right:1rem;background:#1a1410;color:#c9a96e;font-family:'Inter', sans-serif;font-size:0.7rem;font-weight:600;letter-spacing:0.1em;padding:0.3rem 0.75rem;">
                  −{{ discount() }}%
                </div>
              }
            </div>
          </div>

          <!-- Details -->
          <div>
            <div class="cat-tag">{{ product()!.category }}</div>
            <h1 class="product-title">{{ product()!.name }}</h1>

            <!-- Stars -->
            <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1.25rem;">
              @if (reviews().length > 0) {
                <div class="stars">
                  @for (s of [1,2,3,4,5]; track s) {
                    <svg width="14" height="14" [style.color]="s <= avgRating() ? '#c9a96e' : '#ddd8d0'" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  }
                </div>
                <span style="font-family:'Inter', sans-serif;font-size:0.8rem;color:#9e9890;">
                  {{ avgRating().toFixed(1) }} · {{ reviews().length }} review{{ reviews().length !== 1 ? 's' : '' }}
                </span>
              } @else {
                <span style="font-family:'Inter', sans-serif;font-size:0.8rem;color:#b0a898;font-style:italic;">No reviews yet</span>
              }
            </div>

            <p style="font-family:'Inter', sans-serif;font-size:0.9rem;color:#6b6560;line-height:1.8;margin-bottom:1.5rem;">
              {{ product()!.description }}
            </p>

            <!-- Price -->
            <div class="price-block">
              <div>
                <div style="font-family:'Inter', sans-serif;font-size:0.65rem;letter-spacing:0.15em;text-transform:uppercase;color:#9e9890;margin-bottom:0.375rem;">Your Price</div>
                <span class="price-main">PKR {{ product()!.sellerPrice | number }}</span>
                @if (product()!.originalPrice > product()!.sellerPrice) {
                  <span class="price-orig">{{ product()!.originalPrice | number }}</span>
                }
              </div>
              <div style="text-align:right;">
                <div style="font-family:'Inter', sans-serif;font-size:0.65rem;letter-spacing:0.15em;text-transform:uppercase;color:#9e9890;margin-bottom:0.375rem;">Payment</div>
                <span style="font-family:'Inter', sans-serif;font-size:0.78rem;color:#16a34a;display:flex;align-items:center;gap:0.375rem;">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                  Cash on Delivery
                </span>
              </div>
            </div>

            <!-- Stock -->
            <div class="stock-row">
              @if (product()!.stock > 10) {
                <span class="stock-dot" style="background:#16a34a;"></span>
                <span style="color:#16a34a;">In Stock</span>
              } @else if (product()!.stock > 0) {
                <span class="stock-dot" style="background:#d97706;"></span>
                <span style="color:#d97706;">Only {{ product()!.stock }} left</span>
              } @else {
                <span class="stock-dot" style="background:#dc2626;"></span>
                <span style="color:#dc2626;">Out of Stock</span>
              }
            </div>

            <!-- Qty -->
            <div class="qty-row">
              <span class="qty-label">Quantity</span>
              <div class="qty-ctrl">
                <button class="qty-btn" (click)="qty > 1 ? qty = qty - 1 : null">−</button>
                <span class="qty-num">{{ qty }}</span>
                <button class="qty-btn" (click)="qty = qty + 1">+</button>
              </div>
            </div>

            <!-- CTAs -->
            <div class="cta-row">
              <button (click)="addToCart()" [disabled]="product()!.stock === 0"
                class="btn-primary" style="flex:1;opacity:1;"
                [style.opacity]="product()!.stock === 0 ? '0.4' : '1'"
                [style.cursor]="product()!.stock === 0 ? 'not-allowed' : 'pointer'">
                Add to Bag
              </button>
              <a routerLink="/cart" class="btn-outline">View Bag</a>
            </div>

            @if (product()!.tags && product()!.tags.length > 0) {
              <div class="tags">
                @for (tag of product()!.tags; track tag) {
                  <span class="tag">#{{ tag }}</span>
                }
              </div>
            }
          </div>
        </div>

        <!-- Reviews -->
        <div style="height:1px;background:linear-gradient(90deg,transparent,#e8e0d6,transparent);margin-bottom:4rem;"></div>

        <div class="reviews-section">
          <h2 class="reviews-title">Customer Reviews</h2>
          <p class="reviews-sub">Only from verified buyers who received their order.</p>

          @if (reviews().length === 0) {
            <div style="padding:3rem 2rem;background:#f5f0e8;border:1px solid #e8e0d6;text-align:center;">
              <div style="display:flex;justify-content:center;margin-bottom:0.75rem;">
                <svg width="32" height="32" viewBox="0 0 20 20" fill="#ddd8d0"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
              </div>
              <div style="font-family:'DM Serif Display', serif;font-size:1.25rem;color:#6b6560;">No reviews yet</div>
              <div style="font-family:'Inter', sans-serif;font-size:0.8rem;color:#9e9890;margin-top:0.375rem;">Reviews appear after customers receive their orders.</div>
            </div>
          } @else {
            <div class="rating-summary">
              <div>
                <div class="rating-big">{{ avgRating().toFixed(1) }}</div>
                <div style="display:flex;gap:2px;justify-content:center;margin-top:0.5rem;">
                  @for (s of [1,2,3,4,5]; track s) {
                    <svg width="12" height="12" [style.color]="s <= avgRating() ? '#c9a96e' : '#ddd8d0'" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  }
                </div>
                <div style="font-family:'Inter', sans-serif;font-size:0.7rem;color:#9e9890;text-align:center;margin-top:0.25rem;">{{ reviews().length }} reviews</div>
              </div>
              <div style="flex:1;">
                @for (n of [5,4,3,2,1]; track n) {
                  <div class="rating-bar-row">
                    <span style="font-family:'Inter', sans-serif;font-size:0.72rem;color:#9e9890;width:8px;">{{ n }}</span>
                    <div class="rating-bar-track">
                      <div class="rating-bar-fill" [style.width.%]="ratingPercent(n)"></div>
                    </div>
                    <span style="font-family:'Inter', sans-serif;font-size:0.72rem;color:#b0a898;width:20px;">{{ ratingCount(n) }}</span>
                  </div>
                }
              </div>
            </div>

            @for (review of reviews(); track review.id) {
              <div class="review-card">
                <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;flex-wrap:wrap;">
                  <div style="display:flex;align-items:center;gap:0.875rem;">
                    <div style="width:36px;height:36px;background:#e8e0d6;display:flex;align-items:center;justify-content:center;font-family:'DM Serif Display', serif;font-size:1rem;font-weight:600;color:#6b6560;">
                      {{ review.buyerName.charAt(0).toUpperCase() }}
                    </div>
                    <div>
                      <div class="reviewer-name">{{ review.buyerName }}</div>
                      <div style="display:flex;gap:2px;margin-top:2px;">
                        @for (s of [1,2,3,4,5]; track s) {
                          <svg width="11" height="11" [style.color]="s <= review.rating ? '#c9a96e' : '#ddd8d0'" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                          </svg>
                        }
                      </div>
                    </div>
                  </div>
                  <div style="display:flex;align-items:center;gap:0.75rem;">
                    <span class="verified-badge">
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:2px;"><polyline points="20 6 9 17 4 12"/></svg>
                      Verified
                    </span>
                    <span style="font-family:'Inter', sans-serif;font-size:0.72rem;color:#b0a898;">{{ review.createdAt | date:'MMM d, y' }}</span>
                  </div>
                </div>
                @if (review.comment) {
                  <p class="review-text">{{ review.comment }}</p>
                }
              </div>
            }
          }
        </div>

      } @else {
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:4rem;padding:3rem 0;">
          <div class="skeleton" style="aspect-ratio:1/1;"></div>
          <div style="display:flex;flex-direction:column;gap:1rem;padding-top:1rem;">
            <div class="skeleton" style="height:12px;width:80px;"></div>
            <div class="skeleton" style="height:40px;width:75%;"></div>
            <div class="skeleton" style="height:14px;width:100%;"></div>
            <div class="skeleton" style="height:14px;width:85%;"></div>
            <div class="skeleton" style="height:80px;width:100%;margin-top:1rem;"></div>
          </div>
        </div>
      }
    </div>
  `
})
export class ProductDetailComponent implements OnInit {
  private route          = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private cartService    = inject(CartService);
  private http           = inject(HttpClient);

  product = signal<Product | undefined>(undefined);
  reviews = signal<Review[]>([]);
  qty = 1;

  private apiUrl = environment.apiUrl;

  discount = computed(() => {
    const p = this.product();
    if (!p || p.originalPrice <= p.sellerPrice) return 0;
    return Math.round((1 - p.sellerPrice / p.originalPrice) * 100);
  });

  avgRating = computed(() => {
    const r = this.reviews();
    if (!r.length) return 0;
    return r.reduce((sum, rv) => sum + rv.rating, 0) / r.length;
  });

  ratingCount(n: number): number { return this.reviews().filter(r => r.rating === n).length; }
  ratingPercent(n: number): number {
    if (!this.reviews().length) return 0;
    return (this.ratingCount(n) / this.reviews().length) * 100;
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.productService.getProductById(id).subscribe(p => this.product.set(p));
    this.http.get<Review[]>(`${this.apiUrl}/reviews/${id}`).subscribe({
      next: r => this.reviews.set(r),
      error: () => this.reviews.set([])
    });
  }

  addToCart() {
    if (this.product()) this.cartService.addToCart(this.product()!, this.qty);
  }
}
