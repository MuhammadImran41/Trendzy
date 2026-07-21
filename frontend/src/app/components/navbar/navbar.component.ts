import { Component, inject, signal, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { CategoryService, Category } from '../../services/category.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  styles: [`
    :host { display: block; }

    .topbar {
      position: fixed; top: 0; left: 0; right: 0; z-index: 101;
      background: #1a1410; color: #c9a96e;
      text-align: center; padding: 0.45rem 1rem;
      font-family: 'Inter', sans-serif; font-size: 0.72rem; letter-spacing: 0.1em;
    }

    .nav-outer {
      position: fixed; top: 34px; left: 0; right: 0; z-index: 100;
      display: flex; justify-content: center;
      padding: 10px 24px; pointer-events: none;
    }

    nav {
      pointer-events: all; width: 100%; max-width: 1200px;
      background: #1e1e1e; border-radius: 999px;
      display: flex; align-items: center;
      padding: 0 8px 0 24px; height: 68px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.35);
      transition: box-shadow 0.3s; position: relative;
    }
    nav.scrolled { box-shadow: 0 12px 40px rgba(0,0,0,0.5); }

    .logo {
      display: flex; align-items: center; gap: 10px;
      text-decoration: none; flex-shrink: 0; margin-right: 28px;
    }
    .logo-wordmark {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 20px; font-weight: 700; letter-spacing: 4px;
    }
    .logo-wordmark .t { color: #fff; }
    .logo-wordmark .z {
      background: linear-gradient(135deg, #c8920a, #f5d160);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }

    .nav-links { display: flex; align-items: center; gap: 0.25rem; flex: 1; }

    .nav-link {
      font-family: 'Inter', sans-serif; font-size: 0.82rem; font-weight: 400;
      color: #d4d0cb; text-decoration: none;
      padding: 0.45rem 0.85rem; border-radius: 999px;
      transition: background 0.2s, color 0.2s; white-space: nowrap;
      background: none; border: none; cursor: pointer; position: relative;
    }
    .nav-link:hover, .nav-link.active { background: rgba(255,255,255,0.1); color: #fff; }

    /* ── Mega menu wrapper ── */
    .shop-wrapper {
      position: static;
    }
    .shop-wrapper:hover .mega-menu { opacity: 1; pointer-events: all; transform: translateY(0); }

    .mega-menu {
      position: fixed;
      top: 112px;
      left: 50%;
      transform: translateX(-50%) translateY(-8px);
      width: min(900px, 94vw);
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.18);
      padding: 0;
      z-index: 200;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s, transform 0.2s;
      overflow: hidden;
    }

    /* ── Mega header ── */
    .mega-header {
      background: #1a1410; padding: 1rem 1.5rem;
      display: flex; align-items: center; justify-content: space-between;
    }
    .mega-title {
      font-family: 'DM Serif Display', serif; font-size: 1rem; color: #c9a96e;
    }
    .mega-all {
      font-family: 'Inter', sans-serif; font-size: 0.72rem; color: #c9a96e;
      text-decoration: none; letter-spacing: 0.1em; text-transform: uppercase;
      border-bottom: 1px solid rgba(201,169,110,0.4); padding-bottom: 1px;
    }
    .mega-all:hover { color: #fff; border-color: #fff; }

    /* ── Category tabs (left) ── */
    .mega-body { display: flex; height: 340px; }

    .mega-cats {
      width: 200px; flex-shrink: 0;
      background: #faf7f4; border-right: 1px solid #f0ebe4;
      overflow-y: auto; padding: 0.5rem 0;
    }
    .mega-cat-item {
      display: flex; align-items: center; justify-content: space-between;
      padding: 0.625rem 1rem; cursor: pointer;
      font-family: 'Inter', sans-serif; font-size: 0.8rem; color: #6b6560;
      transition: background 0.15s, color 0.15s; border: none; background: none;
      width: 100%; text-align: left;
    }
    .mega-cat-item:hover, .mega-cat-item.active {
      background: #fff; color: #1a1410; font-weight: 600;
    }
    .mega-cat-item.active { border-left: 2px solid #c9a96e; }
    .mega-cat-arrow { color: #c9a96e; font-size: 0.7rem; }

    /* ── Subcategories (right) ── */
    .mega-subs {
      flex: 1; padding: 1.25rem 1.5rem; overflow-y: auto;
    }
    .mega-subs-title {
      font-family: 'DM Serif Display', serif; font-size: 1.1rem; color: #1a1410;
      margin-bottom: 1rem; padding-bottom: 0.5rem;
      border-bottom: 1px solid #f0ebe4;
    }
    .mega-subs-grid {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.4rem;
    }
    .mega-sub-link {
      font-family: 'Inter', sans-serif; font-size: 0.78rem; color: #6b6560;
      text-decoration: none; padding: 0.4rem 0.6rem; border-radius: 6px;
      transition: background 0.15s, color 0.15s; display: block;
    }
    .mega-sub-link:hover { background: #f5f0e8; color: #1a1410; }

    /* ── Shop all tile ── */
    .mega-shop-all {
      margin-top: 1rem; padding: 0.75rem; background: #1a1410;
      border-radius: 8px; text-align: center; text-decoration: none;
      font-family: 'Inter', sans-serif; font-size: 0.75rem; font-weight: 600;
      color: #c9a96e; letter-spacing: 0.1em; text-transform: uppercase;
      display: block; transition: background 0.2s;
    }
    .mega-shop-all:hover { background: #2d2520; }

    /* ── Right actions ── */
    .nav-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; margin-left: auto; }

    .btn-ghost {
      font-family: 'Inter', sans-serif; font-size: 0.82rem; font-weight: 400;
      color: #d4d0cb; background: none; border: none; cursor: pointer;
      padding: 0.45rem 0.85rem; border-radius: 999px;
      text-decoration: none; transition: background 0.2s, color 0.2s; white-space: nowrap;
    }
    .btn-ghost:hover { background: rgba(255,255,255,0.1); color: #fff; }

    .btn-primary {
      display: flex; align-items: center; gap: 6px;
      font-family: 'Inter', sans-serif; font-size: 0.82rem; font-weight: 600;
      background: #b3924e; color: #fff; border: none; cursor: pointer;
      padding: 0.5rem 1.25rem; border-radius: 999px;
      text-decoration: none; transition: filter 0.2s, box-shadow 0.2s; white-space: nowrap;
      box-shadow: 0 2px 14px rgba(179,146,78,0.4);
    }
    .btn-primary:hover { filter: brightness(1.08); box-shadow: 0 4px 20px rgba(179,146,78,0.6); }

    .cart-count {
      background: #c9a96e; color: #fff; width: 17px; height: 17px;
      border-radius: 50%; font-size: 0.6rem; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
    }

    .hamburger {
      display: none; flex-direction: column; gap: 5px;
      background: none; border: none; cursor: pointer; padding: 0.4rem; margin-left: 4px;
    }
    .hamburger span { display: block; width: 22px; height: 1.5px; background: #d4d0cb; transition: all 0.3s; }

    .mobile-menu {
      position: fixed; top: 100px; left: 12px; right: 12px;
      background: #1e1e1e; border-radius: 20px;
      padding: 1rem 1.5rem 1.5rem; z-index: 99;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      max-height: 70vh; overflow-y: auto;
    }
    .mobile-link {
      display: block; padding: 0.75rem 0; border-bottom: 1px solid rgba(255,255,255,0.07);
      font-family: 'Inter', sans-serif; font-size: 0.9rem; font-weight: 400;
      color: #d4d0cb; text-decoration: none; transition: color 0.2s;
    }
    .mobile-link:last-child { border-bottom: none; }
    .mobile-link:hover { color: #fff; }
    .mobile-cat-label {
      font-family: 'Inter', sans-serif; font-size: 0.65rem; font-weight: 600;
      letter-spacing: 0.15em; text-transform: uppercase; color: #c9a96e;
      padding: 0.875rem 0 0.375rem; display: block;
    }

    @media (max-width: 768px) {
      .nav-links { display: none; }
      .btn-ghost { display: none; }
      .hamburger { display: flex; }
      .nav-outer { padding: 10px 12px; }
      nav { padding: 0 6px 0 16px; }
      .logo-wordmark { font-size: 17px; letter-spacing: 3px; }
    }
  `],
  template: `
    @if (!isSellerRoute()) {
    <div class="topbar">
      ✦ Free Delivery on Orders Over PKR 2,000 &nbsp;·&nbsp; Cash on Delivery Available ✦
    </div>

    <div class="nav-outer">
      <nav [class.scrolled]="scrolled">

        <!-- Logo -->
        <a routerLink="/" class="logo">
          <svg width="30" height="30" viewBox="0 0 84 96" fill="none">
            <rect x="6" y="30" width="72" height="58" rx="8" fill="#2a2a2a"/>
            <path d="M28 30 C28 14 56 14 56 30" stroke="#c8960c" stroke-width="5.5" stroke-linecap="round" fill="none"/>
            <rect x="6" y="30" width="72" height="8" rx="4" fill="#c8960c"/>
            <text x="35" y="74" font-family="Georgia,serif" font-size="28" font-weight="700" fill="#f5d160" text-anchor="middle">T</text>
            <text x="51" y="74" font-family="Georgia,serif" font-size="28" font-weight="700" fill="#fff" text-anchor="middle">Z</text>
          </svg>
          <div class="logo-wordmark"><span class="t">TREND</span><span class="z">ZY</span></div>
        </a>

        <!-- Nav links -->
        <div class="nav-links">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}" class="nav-link">Home</a>

          <!-- Shop with mega menu -->
          <div class="shop-wrapper">
            <a routerLink="/products" class="nav-link">
              Shop ▾
            </a>
            @if (categories().length > 0) {
              <div class="mega-menu">
                <div class="mega-header">
                  <span class="mega-title">Shop by Category</span>
                  <a routerLink="/products" class="mega-all">View All Products →</a>
                </div>
                <div class="mega-body">
                  <!-- Categories list -->
                  <div class="mega-cats">
                    @for (cat of categories(); track cat.id) {
                      <button class="mega-cat-item"
                        [class.active]="activeCategory()?.id === cat.id"
                        (mouseenter)="activeCategory.set(cat)">
                        {{ cat.name }}
                        <span class="mega-cat-arrow">›</span>
                      </button>
                    }
                  </div>
                  <!-- Subcategories -->
                  <div class="mega-subs">
                    @if (activeCategory()) {
                      <div class="mega-subs-title">{{ activeCategory()!.name }}</div>
                      <div class="mega-subs-grid">
                        @for (sub of (activeCategory()!.subcategories || []); track sub) {
                          <a [routerLink]="['/products']"
                             [queryParams]="{category: activeCategory()!.name, sub: sub}"
                             class="mega-sub-link">
                            {{ sub }}
                          </a>
                        }
                      </div>
                      <a [routerLink]="['/products']"
                         [queryParams]="{category: activeCategory()!.name}"
                         class="mega-shop-all">
                        Shop All {{ activeCategory()!.name }}
                      </a>
                    } @else {
                      <div style="color:#9e9890;font-family:'Inter',sans-serif;font-size:0.85rem;padding:2rem;text-align:center;">
                        Hover over a category to see subcategories
                      </div>
                    }
                  </div>
                </div>
              </div>
            }
          </div>

          <a routerLink="/try-on" routerLinkActive="active" class="nav-link" style="color:#c9a96e;">✨ Try On</a>
        </div>

        <!-- Right actions -->
        <div class="nav-actions">
          <a routerLink="/cart" class="btn-ghost">
            Bag @if (cart.totalItems() > 0) {<span class="cart-count">{{ cart.totalItems() }}</span>}
          </a>
          <a routerLink="/checkout" class="btn-primary">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
            </svg>
            Checkout
          </a>
          <button class="hamburger" (click)="mobileOpen.set(!mobileOpen())" aria-label="Menu">
            <span [style.transform]="mobileOpen() ? 'rotate(45deg) translate(5px,5px)' : ''"></span>
            <span [style.opacity]="mobileOpen() ? '0' : '1'"></span>
            <span [style.transform]="mobileOpen() ? 'rotate(-45deg) translate(5px,-5px)' : ''"></span>
          </button>
        </div>
      </nav>
    </div>

    <!-- Mobile menu -->
    @if (mobileOpen()) {
      <div class="mobile-menu">
        <a routerLink="/" (click)="mobileOpen.set(false)" class="mobile-link">Home</a>
        <a routerLink="/products" (click)="mobileOpen.set(false)" class="mobile-link">Shop All</a>
        <span class="mobile-cat-label">Categories</span>
        @for (cat of categories().slice(0, 12); track cat.id) {
          <a routerLink="/products" [queryParams]="{category: cat.name}"
             (click)="mobileOpen.set(false)" class="mobile-link">
            {{ cat.name }}
          </a>
        }
        <a routerLink="/try-on" (click)="mobileOpen.set(false)" class="mobile-link" style="color:#c9a96e;">✨ Try On</a>
        <a routerLink="/cart" (click)="mobileOpen.set(false)" class="mobile-link">
          Bag @if (cart.totalItems() > 0) { ({{ cart.totalItems() }}) }
        </a>
      </div>
    }
    }
  `
})
export class NavbarComponent {
  cart           = inject(CartService);
  private catSvc = inject(CategoryService);
  private router = inject(Router);

  mobileOpen     = signal(false);
  scrolled       = false;
  categories     = signal<Category[]>([]);
  activeCategory = signal<Category | null>(null);

  isSellerRoute() { return this.router.url.startsWith('/seller'); }

  @HostListener('window:scroll')
  onScroll() { this.scrolled = window.scrollY > 10; }

  constructor() {
    this.catSvc.getCategories().subscribe(cats => {
      this.categories.set(cats);
      if (cats.length > 0) this.activeCategory.set(cats[0]);
    });
  }
}
