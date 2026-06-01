import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductCardComponent } from '../../../components/product-card/product-card.component';
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule, ProductCardComponent],
  template: `
    <!-- Hero -->
    <section class="relative min-h-[90vh] flex items-center overflow-hidden">
      <!-- Background mesh -->
      <div class="absolute inset-0">
        <div class="absolute top-20 left-1/4 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl"></div>
        <div class="absolute bottom-20 right-1/4 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl"></div>
        <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-900/10 via-dark-900 to-dark-900"></div>
      </div>

      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div class="max-w-2xl animate-fade-up">
          <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-body font-medium mb-6">
            ✨ Premium Beauty — No Sign-up Required
          </span>
          <h1 class="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
            Glow Different.<br/>
            <span class="gradient-text">Shop Freely.</span>
          </h1>
          <p class="text-gray-400 text-lg font-body leading-relaxed mb-8">
            Premium skincare, makeup and fragrance. No account needed — just browse, order, and we deliver to your door. Cash on delivery available.
          </p>
          <div class="flex flex-wrap gap-4">
            <a routerLink="/products"
               class="px-8 py-4 bg-brand-600 hover:bg-brand-500 rounded-2xl font-body font-semibold text-white transition-all hover:shadow-2xl hover:shadow-brand-500/30 hover:-translate-y-0.5">
              Shop Now →
            </a>
            <a href="#categories"
               class="px-8 py-4 glass hover:border-white/20 rounded-2xl font-body font-medium text-gray-300 hover:text-white transition-all">
              Browse Categories
            </a>
          </div>

          <!-- Trust badges -->
          <div class="flex flex-wrap gap-6 mt-10">
            @for (badge of badges; track badge.label) {
              <div class="flex items-center gap-2 text-sm font-body text-gray-400">
                <span>{{ badge.icon }}</span>
                <span>{{ badge.label }}</span>
              </div>
            }
          </div>
        </div>
      </div>
    </section>

    <!-- Categories -->
    <section id="categories" class="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 class="font-display text-3xl font-bold text-white mb-8">Shop by Category</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        @for (cat of categories; track cat.name) {
          <a routerLink="/products" [queryParams]="{category: cat.name}"
             class="glass rounded-2xl p-6 text-center card-hover group">
            <span class="text-4xl mb-3 block">{{ cat.icon }}</span>
            <span class="font-body font-medium text-white group-hover:text-brand-300 transition-colors">{{ cat.name }}</span>
          </a>
        }
      </div>
    </section>

    <!-- Featured Products -->
    <section class="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-end justify-between mb-8">
        <div>
          <h2 class="font-display text-3xl font-bold text-white">Featured Products</h2>
          <p class="text-gray-400 font-body mt-1">Handpicked bestsellers just for you</p>
        </div>
        <a routerLink="/products" class="text-brand-400 hover:text-brand-300 font-body text-sm transition-colors">View all →</a>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (product of products(); track product.id) {
          <app-product-card [product]="product" />
        }
      </div>
    </section>

    <!-- How it works -->
    <section class="py-20 bg-dark-800/50 border-y border-white/5">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="font-display text-3xl font-bold text-white text-center mb-12">How It Works</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          @for (step of steps; track step.no) {
            <div class="text-center">
              <div class="w-14 h-14 rounded-2xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center mx-auto mb-4 text-2xl">
                {{ step.icon }}
              </div>
              <h3 class="font-display font-semibold text-white mb-2">{{ step.title }}</h3>
              <p class="text-gray-400 font-body text-sm leading-relaxed">{{ step.desc }}</p>
            </div>
          }
        </div>
      </div>
    </section>
  `
})
export class HomeComponent implements OnInit {
  private productService = inject(ProductService);
  products = signal<Product[]>([]);

  badges = [
    { icon: '🚚', label: 'Free delivery over PKR 2000' },
    { icon: '💳', label: 'Cash on Delivery' },
    { icon: '↩️', label: '7-day returns' },
    { icon: '✅', label: '100% Original' },
  ];

  categories = [
    { name: 'Skincare', icon: '🧴' },
    { name: 'Makeup', icon: '💄' },
    { name: 'Fragrance', icon: '🌸' },
    { name: 'Haircare', icon: '💆' },
  ];

  steps = [
    { no: 1, icon: '🛒', title: 'Browse & Select', desc: 'Explore our curated collection of premium beauty products. No login required.' },
    { no: 2, icon: '📦', title: 'Place Your Order', desc: 'Add to cart, fill in your address and phone number — done in 60 seconds.' },
    { no: 3, icon: '🚪', title: 'We Deliver', desc: 'Your order arrives at your door. Pay cash on delivery. Simple.' },
  ];

  ngOnInit() {
    this.productService.getProducts().subscribe(p => this.products.set(p.slice(0, 6)));
  }
}
