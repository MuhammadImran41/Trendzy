import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ProductCardComponent } from '../../../components/product-card/product-card.component';
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductCardComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      <!-- Header -->
      <div class="mb-10">
        <h1 class="font-display text-4xl font-bold text-white mb-2">All Products</h1>
        <p class="text-gray-400 font-body">{{ filtered().length }} products found</p>
      </div>

      <div class="flex flex-col lg:flex-row gap-8">

        <!-- Filters -->
        <aside class="w-full lg:w-56 flex-shrink-0">
          <div class="glass rounded-2xl p-5 sticky top-20">
            <h3 class="font-body font-semibold text-white mb-4 text-sm uppercase tracking-widest">Filters</h3>

            <!-- Search -->
            <div class="mb-4">
              <input type="text" [ngModel]="searchQuery()" (ngModelChange)="searchQuery.set($event)" placeholder="Search products..."
                class="w-full bg-dark-700 border border-white/10 rounded-xl px-3 py-2 text-sm font-body text-white placeholder-gray-500 focus:outline-none focus:border-brand-500/50" />
            </div>

            <!-- Categories -->
            <div class="mb-4">
              <p class="text-xs font-body text-gray-500 uppercase tracking-widest mb-2">Category</p>
              <div class="space-y-1">
                <button (click)="selectedCategory.set('')"
                  [class.text-brand-400]="selectedCategory() === ''"
                  class="w-full text-left text-sm font-body text-gray-400 hover:text-white transition-colors py-1">All</button>
                @for (cat of categories(); track cat) {
                  <button (click)="selectedCategory.set(cat)"
                    [class.text-brand-400]="selectedCategory() === cat"
                    class="w-full text-left text-sm font-body text-gray-400 hover:text-white transition-colors py-1">
                    {{ cat }}
                  </button>
                }
              </div>
            </div>

            <!-- Sort -->
            <div>
              <p class="text-xs font-body text-gray-500 uppercase tracking-widest mb-2">Sort by</p>
              <select [ngModel]="sortBy()" (ngModelChange)="sortBy.set($event)"
                class="w-full bg-dark-700 border border-white/10 rounded-xl px-3 py-2 text-sm font-body text-white focus:outline-none focus:border-brand-500/50">
                <option value="default">Default</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </aside>

        <!-- Grid -->
        <div class="flex-1">
          @if (filtered().length === 0) {
            <div class="text-center py-20 text-gray-500 font-body">No products found.</div>
          } @else {
            <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              @for (product of filtered(); track product.id) {
                <app-product-card [product]="product" />
              }
            </div>
          }
        </div>

      </div>
    </div>
  `
})
export class ProductsComponent implements OnInit {
  private productService = inject(ProductService);
  private route = inject(ActivatedRoute);
  allProducts = signal<Product[]>([]);
  categories = signal<string[]>([]);
  searchQuery = signal('');
  selectedCategory = signal('');
  sortBy = signal('default');

  filtered = computed(() => {
    let items = this.allProducts();
    const q = this.searchQuery().toLowerCase();
    const cat = this.selectedCategory();
    const sort = this.sortBy();
    if (q) {
      items = items.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    if (cat) {
      items = items.filter(p => p.category === cat);
    }
    if (sort === 'price-asc') items = [...items].sort((a, b) => a.sellerPrice - b.sellerPrice);
    if (sort === 'price-desc') items = [...items].sort((a, b) => b.sellerPrice - a.sellerPrice);
    return items;
  });

  ngOnInit() {
    this.productService.getProducts().subscribe(p => this.allProducts.set(p));
    this.productService.getCategories().subscribe(c => this.categories.set(c));
    // Read category from query params (e.g. from home page category links)
    this.route.queryParams.subscribe(params => {
      if (params['category']) this.selectedCategory.set(params['category']);
    });
  }
}
