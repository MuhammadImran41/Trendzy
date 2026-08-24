import { Component, OnInit, inject, signal, computed, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ProductCardComponent } from '../../../components/product-card/product-card.component';
import { ProductService } from '../../../services/product.service';
import { CategoryService, Category } from '../../../services/category.service';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductCardComponent],
  styles: [`
    /* ── Sticky category tab bar ── */
    .cat-nav {
      border-bottom: 1px solid #e8e0d6;
      background: #faf7f4;
      position: sticky; top: 122px; z-index: 50;
    }
    .cat-nav-wrap {
      position: relative;
      max-width: 1280px; margin: 0 auto;
    }
    .cat-nav-inner {
      padding: 0 2.5rem;
      display: flex; overflow-x: auto; overflow-y: visible; gap: 0;
    }
    .cat-nav-inner::-webkit-scrollbar { display: none; }

    /* scroll arrows */
    .scroll-arrow {
      position: absolute; top: 0; bottom: 0;
      width: 2.5rem;
      display: flex; align-items: center; justify-content: center;
      background: linear-gradient(to right, #faf7f4 60%, transparent);
      border: none; cursor: pointer; z-index: 10;
      color: #6b6560; font-size: 1rem;
      transition: color 0.2s;
    }
    .scroll-arrow:hover { color: #1a1410; }
    .scroll-arrow.left  { left: 0; background: linear-gradient(to right, #faf7f4 60%, transparent); }
    .scroll-arrow.right { right: 0; background: linear-gradient(to left, #faf7f4 60%, transparent); }

    .cat-tab-wrap { position: relative; flex-shrink: 0; }

    .cat-tab {
      font-family: 'Inter', sans-serif; font-size: 0.78rem; font-weight: 500;
      letter-spacing: 0.03em; color: #6b6560; white-space: nowrap;
      padding: 0.875rem 1rem; cursor: pointer;
      border-bottom: 2px solid transparent; margin-bottom: -1px;
      background: none; border-top: none; border-left: none; border-right: none;
      transition: color 0.2s;
      display: flex; align-items: center; gap: 4px;
    }
    .cat-tab:hover { color: #1a1410; }
    .cat-tab.active { color: #1a1410; border-bottom: 2px solid #c9a96e; font-weight: 600; }
    .cat-tab.all-tab.active { border-bottom-color: #1a1410; }
    .cat-tab .chevron { font-size: 0.6rem; opacity: 0.5; }

    /* ── Dropdown — fixed to viewport so never clipped ── */
    .cat-dropdown {
      position: fixed;
      min-width: 480px; max-width: 640px;
      background: #fff;
      border: 1px solid #e8e0d6;
      box-shadow: 0 8px 32px rgba(26,20,16,0.12);
      z-index: 9999;
      padding: 0.75rem;
    }
    .cat-dropdown-header {
      font-family: 'Inter', sans-serif; font-size: 0.65rem; font-weight: 600;
      letter-spacing: 0.18em; text-transform: uppercase; color: #9e9890;
      padding: 0 0.5rem 0.5rem; margin-bottom: 0.5rem;
      border-bottom: 1px solid #f0ebe4;
    }
    .cat-dropdown-all {
      display: inline-flex; align-items: center; gap: 0.3rem;
      font-family: 'Inter', sans-serif; font-size: 0.8rem; font-weight: 600;
      color: #1a1410; padding: 0.3rem 0.5rem; margin-bottom: 0.5rem;
      background: none; border: none; cursor: pointer;
    }
    .cat-dropdown-all:hover { color: #c9a96e; }
    .cat-dropdown-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0;
    }
    .cat-dropdown-item {
      display: block; width: 100%;
      padding: 0.4rem 0.625rem;
      font-family: 'Inter', sans-serif; font-size: 0.78rem;
      color: #6b6560; text-align: left;
      background: none; border: none; cursor: pointer;
      transition: background 0.15s, color 0.15s;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      border-radius: 2px;
    }
    .cat-dropdown-item:hover { background: #faf7f4; color: #1a1410; }
    .cat-dropdown-item.active { color: #c9a96e; font-weight: 600; }

    /* ── Page ── */
    .page { max-width: 1280px; margin: 0 auto; padding: 3rem 2rem; }
    @media (max-width: 600px) {
      .page { padding: 1.5rem 1rem; }
      .page-header { flex-direction: column; gap: 1rem; }
      .page-title { font-size: 1.75rem; }
      .header-right { width: 100%; flex-direction: column; gap: 0.75rem; }
      .search-input, .sort-select { width: 100%; }
      .cat-nav-inner { padding: 0 0.75rem; }
    }

    .page-header {
      display: flex; align-items: flex-start; justify-content: space-between;
      gap: 2rem; flex-wrap: wrap;
      margin-bottom: 2.5rem; border-bottom: 1px solid #e8e0d6; padding-bottom: 2rem;
    }
    .page-title { font-family: 'DM Serif Display', Georgia, serif; font-size: 2.5rem; font-weight: 400; color: #1a1410; margin-bottom: 0.375rem; }
    .page-count { font-family: 'Inter', sans-serif; font-size: 0.8rem; letter-spacing: 0.08em; color: #9e9890; }

    .header-right { display: flex; align-items: flex-end; gap: 1.5rem; flex-wrap: wrap; }
    .ctrl-group { display: flex; flex-direction: column; gap: 0.4rem; }
    .ctrl-label { font-family: 'Inter', sans-serif; font-size: 0.65rem; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: #1a1410; }
    .search-input {
      background: #fff; border: 1px solid #ddd8d0; padding: 0.55rem 0.875rem;
      font-family: 'Inter', sans-serif; font-size: 0.85rem; color: #1a1410;
      outline: none; transition: border-color 0.2s; width: 220px;
    }
    .search-input::placeholder { color: #b0a898; }
    .search-input:focus { border-color: #c9a96e; }
    .sort-select {
      background: #fff; border: 1px solid #ddd8d0; padding: 0.55rem 0.875rem;
      font-family: 'Inter', sans-serif; font-size: 0.82rem; color: #1a1410;
      outline: none; cursor: pointer;
    }

    /* ── Grid ── */
    .products-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
    @media (max-width: 900px) { .products-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 480px) { .products-grid { grid-template-columns: repeat(2, 1fr); gap: 0.75rem; } }
    .empty {
      grid-column: 1/-1; text-align: center; padding: 5rem 2rem;
      font-family: 'DM Serif Display', serif; font-size: 1.5rem; color: #b0a898;
    }

    /* ── Cat nav responsive ── */
    @media (max-width: 768px) {
      .cat-nav { top: 98px; }
      .cat-nav-inner { padding: 0 0.75rem; }
    }
    @media (max-width: 480px) {
      .cat-nav { top: 92px; }
    }
  `],
  template: `<div style="padding-top:122px;">
    <!-- ── Category tab bar with dropdowns ── -->
    <div class="cat-nav">
      <div class="cat-nav-wrap">
        <!-- Left arrow -->
        <button class="scroll-arrow left" (click)="scrollNav(-200)">‹</button>

        <div class="cat-nav-inner" #navInner>

          <!-- All tab -->
          <div class="cat-tab-wrap">
            <button class="cat-tab all-tab"
                    [class.active]="selectedCategory() === '' && !selectedSub()"
                    (click)="selectCategory('', '')">
              All
            </button>
          </div>

          <!-- Category tabs with subcategory dropdown -->
          @for (cat of dbCategories(); track cat.id) {
            <div class="cat-tab-wrap"
                 (mouseenter)="onTabMouseEnter($event, cat.id)"
                 (mouseleave)="hoveredCat.set('')">
              <button class="cat-tab"
                      [class.active]="selectedCategory() === cat.name"
                      (click)="selectCategory(cat.name, '')">
                {{ cat.name }}
                @if (cat.subcategories?.length) {
                  <span class="chevron">▾</span>
                }
              </button>

              <!-- Subcategory dropdown — fixed positioned, multi-column -->
              @if (hoveredCat() === cat.id && cat.subcategories?.length) {
                <div class="cat-dropdown"
                     [style.top.px]="dropdownPos().top"
                     [style.left.px]="dropdownPos().left">
                  <button class="cat-dropdown-all" (click)="selectCategory(cat.name, '')">
                    All {{ cat.name }} ›
                  </button>
                  <div class="cat-dropdown-grid">
                    @for (sub of cat.subcategories; track sub) {
                      <button class="cat-dropdown-item"
                              [class.active]="selectedSub() === sub"
                              (click)="selectCategory(cat.name, sub)">
                        {{ sub }}
                      </button>
                    }
                  </div>
                </div>
              }
            </div>
          }

        </div>

        <!-- Right arrow -->
        <button class="scroll-arrow right" (click)="scrollNav(200)">›</button>
      </div>
    </div>

    <!-- ── Products page ── -->
    <div class="page">
      <div class="page-header">
        <div>
          <h1 class="page-title">
            {{ selectedSub() || selectedCategory() || 'All Products' }}
          </h1>
          <p class="page-count">{{ filtered().length }} product{{ filtered().length !== 1 ? 's' : '' }} found</p>
        </div>
        <div class="header-right">
          <div class="ctrl-group">
            <span class="ctrl-label">Search</span>
            <input type="text" class="search-input" placeholder="Search products..."
              [ngModel]="searchQuery()" (ngModelChange)="searchQuery.set($event)" />
          </div>
          <div class="ctrl-group">
            <span class="ctrl-label">Sort By</span>
            <select class="sort-select" [ngModel]="sortBy()" (ngModelChange)="sortBy.set($event)">
              <option value="default">Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      <div class="products-grid">
        @if (filtered().length === 0) {
          <div class="empty">No products found.</div>
        } @else {
          @for (product of filtered(); track product.id) {
            <app-product-card [product]="product" />
          }
        }
      </div>
    </div>
  </div>`
})
export class ProductsComponent implements OnInit {
  private productService  = inject(ProductService);
  private categoryService = inject(CategoryService);
  private route           = inject(ActivatedRoute);

  allProducts      = signal<Product[]>([]);
  dbCategories     = signal<Category[]>([]);
  searchQuery      = signal('');
  selectedCategory = signal('');
  selectedSub      = signal('');
  sortBy           = signal('default');
  hoveredCat       = signal('');

  filtered = computed(() => {
    let items = this.allProducts();
    const q    = this.searchQuery().toLowerCase();
    const cat  = this.selectedCategory();
    const sub  = this.selectedSub();
    const sort = this.sortBy();

    if (q)   items = items.filter(p =>
      p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    if (cat) items = items.filter(p => p.category === cat);
    // sub filter — match against name or tags
    if (sub) items = items.filter(p =>
      p.name.toLowerCase().includes(sub.toLowerCase()) ||
      (p.tags || []).some((t: string) => t.toLowerCase().includes(sub.toLowerCase())));
    if (sort === 'price-asc')  items = [...items].sort((a, b) => a.sellerPrice - b.sellerPrice);
    if (sort === 'price-desc') items = [...items].sort((a, b) => b.sellerPrice - a.sellerPrice);
    return items;
  });

  @ViewChild('navInner') navInner!: ElementRef<HTMLDivElement>;

  scrollNav(by: number) {
    this.navInner?.nativeElement?.scrollBy({ left: by, behavior: 'smooth' });
  }

  selectCategory(cat: string, sub: string) {
    this.selectedCategory.set(cat);
    this.selectedSub.set(sub);
    this.searchQuery.set('');
    this.hoveredCat.set('');
  }

  dropdownPos = signal<{top: number, left: number}>({top: 0, left: 0});

  onTabMouseEnter(event: MouseEvent, catId: string) {
    const el = event.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    this.dropdownPos.set({ top: rect.bottom, left: rect.left });
    this.hoveredCat.set(catId);
  }

  private hiddenCategories = ['Electronics', 'Kitchen', 'Sports', 'Home Decor', 'Bedsheets', 'Kids & Toys', 'Daily Gadgets', 'Stationery'];

  ngOnInit() {
    this.productService.getProducts().subscribe(p => this.allProducts.set(p));
    this.categoryService.getCategories().subscribe(c =>
      this.dbCategories.set(c.filter(cat => !this.hiddenCategories.includes(cat.name)))
    );
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.selectedCategory.set(params['category']);
        this.selectedSub.set(params['sub'] || '');
      }
    });
  }
}
