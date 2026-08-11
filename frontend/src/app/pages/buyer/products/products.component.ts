import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ProductCardComponent } from '../../../components/product-card/product-card.component';
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../models/product.model';

interface NavCat {
  label: string;
  filter: string;
  sub?: { label: string; filter: string }[];
}

const NAV_CATS: NavCat[] = [
  { label: 'Women', filter: 'Clothing', sub: [
    { label: "Stitched",   filter: "Women's Stitched" },
    { label: "Unstitched", filter: "Women's Unstitched" },
    { label: "Casual",     filter: "Women's Casual" },
  ]},
  { label: 'Men', filter: 'Clothing', sub: [
    { label: "Stitched",   filter: "Men's Stitched" },
    { label: "Unstitched", filter: "Men's Unstitched" },
    { label: "Casual",     filter: "Men's Casual" },
  ]},
  { label: 'Beauty',   filter: 'Beauty' },
  { label: 'Footwear', filter: 'Footwear' },
  { label: 'Handbags', filter: 'Accessories' },
  { label: 'Sale',     filter: 'sale' },
];

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductCardComponent],
  styles: [`
    .cat-nav {
      border-bottom: 1px solid #e8e0d6;
      background: #fff;
      position: sticky; top: 96px; z-index: 50;
    }
    .cat-nav-inner {
      max-width: 1280px; margin: 0 auto; padding: 0 2rem;
      display: flex; align-items: center; overflow-x: auto;
    }
    .cat-nav-inner::-webkit-scrollbar { display: none; }

    .cat-tab-wrap { position: relative; flex-shrink: 0; }

    .cat-tab {
      font-family: 'Inter', sans-serif; font-size: 0.78rem; font-weight: 600;
      letter-spacing: 0.08em; text-transform: uppercase;
      color: #6b6560; white-space: nowrap;
      padding: 1rem 1.125rem; cursor: pointer;
      border-bottom: 2px solid transparent; margin-bottom: -1px;
      background: none; border-top: none; border-left: none; border-right: none;
      transition: color 0.2s;
      display: flex; align-items: center; gap: 4px;
    }
    .cat-tab:hover { color: #1a1410; }
    .cat-tab.active { color: #1a1410; border-bottom-color: #1a1410; }
    .cat-tab.sale-tab { color: #c9a96e; }
    .cat-tab.sale-tab.active { border-bottom-color: #c9a96e; }
    .cat-tab .chevron { font-size: 0.55rem; opacity: 0.6; }

    .cat-dropdown {
      position: absolute; top: calc(100% + 1px); left: 0;
      min-width: 200px; background: #fff;
      border: 1px solid #e8e0d6;
      box-shadow: 0 12px 32px rgba(26,20,16,0.1);
      z-index: 9999; padding: 0.5rem 0;
      border-radius: 0 0 8px 8px;
    }
    .cat-dropdown-item {
      display: block; width: 100%; padding: 0.6rem 1.25rem;
      font-family: 'Inter', sans-serif; font-size: 0.82rem;
      color: #6b6560; text-align: left;
      background: none; border: none; cursor: pointer;
      transition: background 0.15s, color 0.15s; white-space: nowrap;
    }
    .cat-dropdown-item:hover { background: #faf7f4; color: #1a1410; }
    .cat-dropdown-item.active { color: #c9a96e; font-weight: 600; }
    .cat-dropdown-divider { height: 1px; background: #f0ebe4; margin: 0.375rem 0; }

    .page { max-width: 1280px; margin: 0 auto; padding: 2.5rem 2rem; }
    @media (max-width: 600px) {
      .page { padding: 1.25rem 1rem; }
      .page-header { flex-direction: column; gap: 0.875rem; }
      .page-title { font-size: 1.75rem; }
      .header-right { width: 100%; flex-direction: column; gap: 0.75rem; }
      .search-input, .sort-select { width: 100%; }
    }

    .page-header {
      display: flex; align-items: flex-start; justify-content: space-between;
      gap: 2rem; flex-wrap: wrap;
      margin-bottom: 2rem; border-bottom: 1px solid #e8e0d6; padding-bottom: 1.5rem;
    }
    .page-title { font-family: 'DM Serif Display', Georgia, serif; font-size: 2rem; font-weight: 400; color: #1a1410; margin-bottom: 0.25rem; }
    .page-count { font-family: 'Inter', sans-serif; font-size: 0.78rem; color: #9e9890; }

    .header-right { display: flex; align-items: flex-end; gap: 1rem; flex-wrap: wrap; }
    .ctrl-group { display: flex; flex-direction: column; gap: 0.35rem; }
    .ctrl-label { font-family: 'Inter', sans-serif; font-size: 0.6rem; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: #9e9890; }
    .search-input {
      background: #faf7f4; border: 1px solid #e8e0d6; padding: 0.5rem 0.875rem;
      font-family: 'Inter', sans-serif; font-size: 0.85rem; color: #1a1410;
      outline: none; transition: border-color 0.2s; width: 220px; border-radius: 6px;
    }
    .search-input::placeholder { color: #b0a898; }
    .search-input:focus { border-color: #c9a96e; }
    .sort-select {
      background: #faf7f4; border: 1px solid #e8e0d6; padding: 0.5rem 0.875rem;
      font-family: 'Inter', sans-serif; font-size: 0.82rem; color: #1a1410;
      outline: none; cursor: pointer; border-radius: 6px;
    }

    .products-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.25rem; }
    @media (max-width: 1100px) { .products-grid { grid-template-columns: repeat(3, 1fr); } }
    @media (max-width: 900px)  { .products-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 480px)  { .products-grid { grid-template-columns: repeat(2, 1fr); gap: 0.75rem; } }
    .empty {
      grid-column: 1/-1; text-align: center; padding: 5rem 2rem;
      font-family: 'DM Serif Display', serif; font-size: 1.5rem; color: #b0a898;
    }

    @media (max-width: 768px) {
      .cat-nav { top: 84px; }
      .cat-nav-inner { padding: 0 1rem; }
      .cat-tab { padding: 0.875rem 0.75rem; font-size: 0.72rem; }
      .cat-dropdown { position: fixed; top: auto !important; left: 0 !important; right: 0; border-radius: 0 0 12px 12px; }
    }
  `],
  template: `<div style="padding-top:96px;">

    <div class="cat-nav">
      <div class="cat-nav-inner">
        @for (cat of navCats; track cat.label) {
          <div class="cat-tab-wrap"
               (mouseenter)="cat.sub?.length ? hovered.set(cat.label) : null"
               (mouseleave)="hovered.set('')">
            <button class="cat-tab"
                    [class.active]="activeCat()===cat.label"
                    [class.sale-tab]="cat.label==='Sale'"
                    (click)="setFilter(cat,null)">
              {{ cat.label }}
              @if (cat.sub?.length) { <span class="chevron">▾</span> }
            </button>
            @if (hovered()===cat.label && cat.sub?.length) {
              <div class="cat-dropdown">
                <button class="cat-dropdown-item" (click)="setFilter(cat,null)">All {{ cat.label }}</button>
                <div class="cat-dropdown-divider"></div>
                @for (s of cat.sub; track s.label) {
                  <button class="cat-dropdown-item"
                          [class.active]="activeSub()===s.label"
                          (click)="setFilter(cat,s)">{{ s.label }}</button>
                }
              </div>
            }
          </div>
        }
      </div>
    </div>

    <div class="page">
      <div class="page-header">
        <div>
          <h1 class="page-title">{{ activeSub() || activeCat() || 'All Products' }}</h1>
          <p class="page-count">{{ filtered().length }} product{{ filtered().length!==1?'s':'' }} found</p>
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
        @if (filtered().length===0) {
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
  private productService = inject(ProductService);
  private route          = inject(ActivatedRoute);

  allProducts = signal<Product[]>([]);
  searchQuery = signal('');
  sortBy      = signal('default');
  activeCat   = signal<string | null>(null);
  activeSub   = signal<string | null>(null);
  hovered     = signal('');
  navCats     = NAV_CATS;

  private _activeNavCat = signal<NavCat | null>(null);
  private _activeNavSub = signal<{ label: string; filter: string } | null>(null);

  setFilter(cat: NavCat | null, sub: { label: string; filter: string } | null) {
    this._activeNavCat.set(cat);
    this._activeNavSub.set(sub);
    this.activeCat.set(cat?.label ?? null);
    this.activeSub.set(sub?.label ?? null);
    this.searchQuery.set('');
    this.hovered.set('');
  }

  filtered = computed(() => {
    let items = this.allProducts();
    const q    = this.searchQuery().toLowerCase();
    const cat  = this._activeNavCat();
    const sub  = this._activeNavSub();
    const sort = this.sortBy();

    // Search
    if (q) items = items.filter(p =>
      p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));

    if (cat) {
      if (cat.label === 'Sale') {
        items = items.filter(p => p.originalPrice > p.sellerPrice);

      } else if (sub) {
        // Sub selected — match exact tag
        items = items.filter(p =>
          p.category === cat.filter &&
          (p.tags || []).includes(sub.filter)
        );

      } else if (cat.label === 'Women') {
        // Women = Clothing where first tag starts with "Women's" OR has women/girls tag
        const womenTags = ["Women's Stitched","Women's Unstitched","Women's Casual","women","girls","abaya","modest","frock","lawn"];
        items = items.filter(p =>
          p.category === 'Clothing' &&
          (p.tags || []).some((t: string) => womenTags.includes(t))
        );

      } else if (cat.label === 'Men') {
        // Men = Clothing where tags include Men's tags
        const menTags = ["Men's Stitched","Men's Unstitched","Men's Casual","men","polo","denim","jeans","t-shirt"];
        items = items.filter(p =>
          p.category === 'Clothing' &&
          (p.tags || []).some((t: string) => menTags.includes(t))
        );

      } else {
        // Beauty, Footwear, Accessories — direct category match
        items = items.filter(p => p.category === cat.filter);
      }
    }

    if (sort === 'price-asc')  items = [...items].sort((a, b) => a.sellerPrice - b.sellerPrice);
    if (sort === 'price-desc') items = [...items].sort((a, b) => b.sellerPrice - a.sellerPrice);
    return items;
  });

  ngOnInit() {
    this.productService.getProducts().subscribe(p => this.allProducts.set(p));
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        const found = NAV_CATS.find(c =>
          c.filter === params['category'] ||
          c.label.toLowerCase() === params['category'].toLowerCase());
        if (found) { this.setFilter(found, null); return; }
      }
      if (params['sort'] === 'sale') {
        this.setFilter(NAV_CATS.find(c => c.label === 'Sale')!, null); return;
      }
      if (params['q']) { this.searchQuery.set(params['q']); return; }
      // Default: show Women
      this.setFilter(NAV_CATS[0], null);
    });
  }
}
