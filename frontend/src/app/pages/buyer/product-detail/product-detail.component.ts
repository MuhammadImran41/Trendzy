import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ProductService } from '../../../services/product.service';
import { CartService } from '../../../services/cart.service';
import { Product } from '../../../models/product.model';
import { Review } from '../../../models/order.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      @if (product()) {
        <!-- Breadcrumb -->
        <nav class="flex items-center gap-2 text-xs font-body text-gray-500 mb-8">
          <a routerLink="/" class="hover:text-brand-400 transition-colors">Home</a>
          <span>/</span>
          <a routerLink="/products" class="hover:text-brand-400 transition-colors">Products</a>
          <span>/</span>
          <span class="text-gray-400">{{ product()!.name }}</span>
        </nav>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">

          <!-- Image -->
          <div class="space-y-4">
            <div class="relative rounded-3xl overflow-hidden bg-dark-800 ring-1 ring-white/5"
                 style="aspect-ratio:1/1;">
              <img [src]="product()!.images[0]" [alt]="product()!.name"
                   class="w-full h-full object-cover" />
              @if (discount() > 0) {
                <div class="absolute top-4 right-4 badge badge-green text-sm px-3 py-1">
                  {{ discount() }}% OFF
                </div>
              }
            </div>
          </div>

          <!-- Details -->
          <div class="flex flex-col justify-center">

            <!-- Category + badges -->
            <div class="flex items-center gap-2 mb-4 flex-wrap">
              <span class="badge badge-brand uppercase tracking-widest">{{ product()!.category }}</span>
              @if (product()!.stock > 0 && product()!.stock <= 5) {
                <span class="badge badge-yellow">Only {{ product()!.stock }} left</span>
              }
            </div>

            <h1 class="font-display text-3xl lg:text-4xl font-bold text-white mb-3 leading-tight">
              {{ product()!.name }}
            </h1>

            <!-- Review summary (real) -->
            <div class="flex items-center gap-3 mb-6">
              @if (reviews().length > 0) {
                <div class="flex gap-0.5">
                  @for (s of [1,2,3,4,5]; track s) {
                    <svg class="w-4 h-4" [class.star-filled]="s <= avgRating()"
                         [class.star-empty]="s > avgRating()" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  }
                </div>
                <span class="text-sm font-body text-gray-400">
                  {{ avgRating().toFixed(1) }} · {{ reviews().length }} verified review{{ reviews().length !== 1 ? 's' : '' }}
                </span>
              } @else {
                <span class="text-sm font-body text-gray-500 italic">No reviews yet — be the first after your delivery!</span>
              }
            </div>

            <p class="text-gray-300 font-body leading-relaxed mb-8 text-base">
              {{ product()!.description }}
            </p>

            <!-- Price block -->
            <div class="glass-card p-5 mb-6 flex items-center justify-between">
              <div>
                <p class="text-xs font-body text-gray-500 mb-1 uppercase tracking-widest">Your Price</p>
                <div class="flex items-baseline gap-3">
                  <span class="font-display text-3xl font-bold text-brand-400">
                    PKR {{ product()!.sellerPrice | number }}
                  </span>
                  @if (product()!.originalPrice > product()!.sellerPrice) {
                    <span class="font-body text-gray-500 line-through text-lg">
                      {{ product()!.originalPrice | number }}
                    </span>
                  }
                </div>
              </div>
              <div class="text-right">
                <p class="text-xs font-body text-gray-500 mb-1">Payment</p>
                <span class="badge badge-green">💳 Cash on Delivery</span>
              </div>
            </div>

            <!-- Stock -->
            <div class="flex items-center gap-2 mb-6">
              @if (product()!.stock > 10) {
                <span class="w-2 h-2 rounded-full bg-green-400"></span>
                <span class="text-sm font-body text-green-400">In Stock</span>
              } @else if (product()!.stock > 0) {
                <span class="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
                <span class="text-sm font-body text-yellow-400">Only {{ product()!.stock }} left</span>
              } @else {
                <span class="w-2 h-2 rounded-full bg-red-400"></span>
                <span class="text-sm font-body text-red-400">Out of Stock</span>
              }
            </div>

            <!-- Quantity -->
            <div class="flex items-center gap-4 mb-6">
              <span class="text-sm font-body text-gray-400 w-20">Quantity</span>
              <div class="flex items-center glass rounded-xl overflow-hidden">
                <button (click)="qty > 1 ? qty = qty - 1 : null"
                  class="w-10 h-10 flex items-center justify-center text-gray-400
                         hover:text-white hover:bg-white/5 transition-colors text-xl font-light">
                  −
                </button>
                <span class="w-10 text-center font-body font-semibold text-white text-base">{{ qty }}</span>
                <button (click)="qty = qty + 1"
                  class="w-10 h-10 flex items-center justify-center text-gray-400
                         hover:text-white hover:bg-white/5 transition-colors text-xl font-light">
                  +
                </button>
              </div>
            </div>

            <!-- CTA buttons -->
            <div class="flex gap-3">
              <button (click)="addToCart()" [disabled]="product()!.stock === 0"
                class="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed">
                🛒 Add to Cart
              </button>
              <a routerLink="/cart" class="btn-ghost px-5">
                View Cart
              </a>
            </div>

            <!-- Tags -->
            @if (product()!.tags && product()!.tags.length > 0) {
              <div class="flex flex-wrap gap-2 mt-6">
                @for (tag of product()!.tags; track tag) {
                  <span class="px-3 py-1 bg-dark-700 rounded-full text-xs font-body text-gray-500
                               border border-white/5 hover:border-brand-500/30 transition-colors">
                    #{{ tag }}
                  </span>
                }
              </div>
            }
          </div>
        </div>

        <!-- ── Reviews Section ──────────────────────────────────────────────── -->
        <div class="section-divider mb-12"></div>

        <div class="max-w-3xl">
          <h2 class="font-display text-2xl font-bold text-white mb-2">Customer Reviews</h2>
          <p class="text-gray-500 font-body text-sm mb-8">
            Reviews are only from verified buyers who received their order.
          </p>

          @if (reviews().length === 0) {
            <div class="glass-card p-10 text-center">
              <div class="text-4xl mb-3">⭐</div>
              <p class="font-display text-lg text-white mb-1">No reviews yet</p>
              <p class="text-gray-500 font-body text-sm">
                Reviews appear here after customers receive their orders.
              </p>
            </div>
          } @else {
            <!-- Rating summary -->
            <div class="glass-card p-6 mb-6 flex items-center gap-8">
              <div class="text-center">
                <p class="font-display text-5xl font-bold text-white">{{ avgRating().toFixed(1) }}</p>
                <div class="flex gap-0.5 justify-center mt-2">
                  @for (s of [1,2,3,4,5]; track s) {
                    <svg class="w-4 h-4" [class.star-filled]="s <= avgRating()"
                         [class.star-empty]="s > avgRating()" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  }
                </div>
                <p class="text-gray-500 text-xs font-body mt-1">{{ reviews().length }} review{{ reviews().length !== 1 ? 's' : '' }}</p>
              </div>
              <div class="flex-1 space-y-1.5">
                @for (n of [5,4,3,2,1]; track n) {
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-body text-gray-500 w-3">{{ n }}</span>
                    <div class="flex-1 h-1.5 bg-dark-700 rounded-full overflow-hidden">
                      <div class="h-full bg-brand-500 rounded-full transition-all"
                           [style.width.%]="ratingPercent(n)"></div>
                    </div>
                    <span class="text-xs font-body text-gray-600 w-6">{{ ratingCount(n) }}</span>
                  </div>
                }
              </div>
            </div>

            <!-- Review list -->
            <div class="space-y-4">
              @for (review of reviews(); track review.id) {
                <div class="glass-card p-5">
                  <div class="flex items-start justify-between mb-3">
                    <div class="flex items-center gap-3">
                      <div class="w-9 h-9 rounded-full bg-brand-600/20 border border-brand-500/30
                                  flex items-center justify-center text-brand-300 font-display font-bold text-sm">
                        {{ review.buyerName.charAt(0).toUpperCase() }}
                      </div>
                      <div>
                        <p class="font-body font-semibold text-white text-sm">{{ review.buyerName }}</p>
                        <div class="flex gap-0.5 mt-0.5">
                          @for (s of [1,2,3,4,5]; track s) {
                            <svg class="w-3 h-3" [class.star-filled]="s <= review.rating"
                                 [class.star-empty]="s > review.rating" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                            </svg>
                          }
                        </div>
                      </div>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="badge badge-green text-xs">✓ Verified Purchase</span>
                      <span class="text-xs font-body text-gray-600">
                        {{ review.createdAt | date:'MMM d, y' }}
                      </span>
                    </div>
                  </div>
                  @if (review.comment) {
                    <p class="text-gray-300 font-body text-sm leading-relaxed">{{ review.comment }}</p>
                  }
                </div>
              }
            </div>
          }
        </div>

      } @else {
        <!-- Loading state -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div class="skeleton rounded-3xl" style="aspect-ratio:1/1;"></div>
          <div class="space-y-4 py-8">
            <div class="skeleton h-6 w-24 rounded-full"></div>
            <div class="skeleton h-10 w-3/4 rounded-xl"></div>
            <div class="skeleton h-4 w-full rounded-lg"></div>
            <div class="skeleton h-4 w-5/6 rounded-lg"></div>
            <div class="skeleton h-20 w-full rounded-2xl mt-4"></div>
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

  private apiUrl = 'http://localhost:8001/api';

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

  ratingCount(n: number): number {
    return this.reviews().filter(r => r.rating === n).length;
  }

  ratingPercent(n: number): number {
    if (!this.reviews().length) return 0;
    return (this.ratingCount(n) / this.reviews().length) * 100;
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.productService.getProductById(id).subscribe(p => this.product.set(p));
    this.http.get<Review[]>(`${this.apiUrl}/reviews/${id}`).subscribe({
      next: (r) => this.reviews.set(r),
      error: () => this.reviews.set([])
    });
  }

  addToCart() {
    if (this.product()) {
      this.cartService.addToCart(this.product()!, this.qty);
    }
  }
}
