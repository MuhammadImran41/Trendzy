import { Component, inject, signal, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, FormsModule],
  styles: [`
    :host { display: block; }

    /* ── Announcement bar ── */
    .topbar {
      position: fixed; top: 0; left: 0; right: 0; z-index: 201;
      background: #1a1410; color: #c9a96e;
      text-align: center; padding: 0.4rem 1rem;
      font-family: 'Inter', sans-serif; font-size: 0.7rem; letter-spacing: 0.12em;
    }

    /* ── Main nav bar ── */
    .nav-bar {
      position: fixed; top: 32px; left: 0; right: 0; z-index: 200;
      background: #fff;
      border-bottom: 1px solid #e8e0d6;
      display: flex; align-items: center;
      padding: 0 2.5rem;
      height: 64px;
      transition: box-shadow 0.3s;
    }
    .nav-bar.scrolled {
      box-shadow: 0 4px 24px rgba(26,20,16,0.08);
    }

    /* ── Logo ── */
    .logo {
      text-decoration: none; flex-shrink: 0;
      display: flex; align-items: center;
    }
    .logo-wordmark {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 22px; font-weight: 800; letter-spacing: 4px; line-height: 1;
    }
    .logo-wordmark .shop { color: #1a1410; }
    .logo-wordmark .zee {
      background: linear-gradient(135deg, #c8920a, #f5d160, #c8920a);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }

    /* ── Center nav links ── */
    .nav-links {
      display: flex; align-items: center;
      position: absolute; left: 50%; transform: translateX(-50%);
      gap: 0;
    }
    .nav-link {
      font-family: 'Inter', sans-serif; font-size: 0.76rem; font-weight: 600;
      color: #1a1410; text-decoration: none;
      padding: 0.5rem 1rem;
      letter-spacing: 0.1em; text-transform: uppercase;
      white-space: nowrap;
      position: relative;
      transition: color 0.2s;
    }
    .nav-link::after {
      content: ''; position: absolute; bottom: 0; left: 1rem; right: 1rem;
      height: 1.5px; background: #1a1410;
      transform: scaleX(0); transform-origin: center;
      transition: transform 0.25s ease;
    }
    .nav-link:hover { color: #1a1410; }
    .nav-link:hover::after { transform: scaleX(1); }
    .nav-link.sale { color: #c9a96e; }
    .nav-link.sale::after { background: #c9a96e; }

    /* ── Right icon actions ── */
    .nav-actions {
      display: flex; align-items: center; gap: 0;
      flex-shrink: 0; margin-left: auto;
    }
    .icon-btn {
      display: flex; align-items: center; justify-content: center;
      width: 40px; height: 40px;
      background: none; border: none; cursor: pointer;
      color: #1a1410; text-decoration: none;
      border-radius: 50%;
      transition: background 0.2s, color 0.2s;
      position: relative;
    }
    .icon-btn:hover { background: #f5f0e8; }
    .icon-btn svg { flex-shrink: 0; }

    .cart-badge {
      position: absolute; top: 2px; right: 2px;
      background: #1a1410; color: #fff;
      width: 16px; height: 16px;
      border-radius: 50%; font-size: 0.55rem; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
      border: 1.5px solid #fff;
    }

    /* ── Search overlay ── */
    .search-overlay {
      position: fixed; inset: 0; z-index: 300;
      background: rgba(26,20,16,0.5);
      display: flex; align-items: flex-start; justify-content: center;
      padding-top: 100px;
    }
    .search-box {
      background: #fff; width: 100%; max-width: 600px;
      margin: 0 1rem; border-radius: 12px;
      overflow: hidden; box-shadow: 0 24px 64px rgba(0,0,0,0.2);
      display: flex; align-items: center;
    }
    .search-input {
      flex: 1; padding: 1rem 1.25rem;
      font-family: 'Inter', sans-serif; font-size: 1rem; color: #1a1410;
      border: none; outline: none; background: none;
    }
    .search-input::placeholder { color: #b0a898; }
    .search-close {
      padding: 1rem; background: none; border: none; cursor: pointer;
      color: #9e9890; font-size: 1.2rem;
    }

    /* ── Hamburger (mobile) ── */
    .hamburger {
      display: none; flex-direction: column; gap: 5px;
      background: none; border: none; cursor: pointer; padding: 0.4rem; margin-left: 8px;
    }
    .hamburger span { display: block; width: 22px; height: 1.5px; background: #1a1410; transition: all 0.3s; }

    /* ── Mobile menu ── */
    .mobile-menu {
      position: fixed; top: 96px; left: 0; right: 0; bottom: 0;
      background: #fff; z-index: 199;
      padding: 1.5rem 1.5rem;
      overflow-y: auto;
      box-shadow: 0 8px 32px rgba(0,0,0,0.15);
    }
    .mobile-link {
      display: flex; align-items: center; justify-content: space-between;
      padding: 1rem 0; border-bottom: 1px solid #f0ebe4;
      font-family: 'Inter', sans-serif; font-size: 0.9rem; font-weight: 600;
      color: #1a1410; text-decoration: none;
      letter-spacing: 0.08em; text-transform: uppercase;
      transition: color 0.2s;
    }
    .mobile-link:last-child { border-bottom: none; }
    .mobile-link:hover { color: #c9a96e; }
    .mobile-link.sale { color: #c9a96e; }

    /* mobile search bar */
    .mobile-search {
      display: flex; align-items: center;
      background: #f5f0e8; border-radius: 10px;
      padding: 0.6rem 1rem; margin-bottom: 1.5rem; gap: 0.5rem;
    }
    .mobile-search input {
      flex: 1; border: none; background: none; outline: none;
      font-family: 'Inter', sans-serif; font-size: 0.875rem; color: #1a1410;
    }
    .mobile-search input::placeholder { color: #b0a898; }

    @media (max-width: 900px) {
      .nav-links { display: none; }
      .hamburger { display: flex; }
      .nav-bar { padding: 0 1rem 0 1.25rem; }
    }
    @media (max-width: 480px) {
      .topbar { font-size: 0.6rem; letter-spacing: 0.06em; padding: 0.35rem 0.5rem; }
      .logo-wordmark { font-size: 18px; letter-spacing: 3px; }
      .nav-bar { height: 56px; top: 28px; }
    }
  `],
  template: `
    @if (!isSellerRoute()) {

    <!-- Announcement bar -->
    <div class="topbar">
      🚚 Free delivery on orders over PKR 2,000 &nbsp;·&nbsp; Cash on Delivery &nbsp;·&nbsp; 7-Day Returns
    </div>

    <!-- Main navbar -->
    <header class="nav-bar" [class.scrolled]="scrolled">

      <!-- Logo -->
      <a routerLink="/" class="logo">
        <div class="logo-wordmark"><span class="shop">SHOP</span><span class="zee">ZEE</span></div>
      </a>

      <!-- Center category links -->
      <nav class="nav-links">
        <a routerLink="/products" [queryParams]="{category:'Clothing'}" class="nav-link">Women</a>
        <a routerLink="/products" [queryParams]="{category:'Clothing'}" class="nav-link">Men</a>
        <a routerLink="/products" [queryParams]="{category:'Beauty'}" class="nav-link">Beauty</a>
        <a routerLink="/products" [queryParams]="{category:'Footwear'}" class="nav-link">Footwear</a>
        <a routerLink="/products" [queryParams]="{category:'Accessories'}" class="nav-link">Handbags</a>
        <a routerLink="/products" [queryParams]="{sort:'sale'}" class="nav-link sale">Sale</a>
      </nav>

      <!-- Right icons -->
      <div class="nav-actions">

        <!-- Search -->
        <button class="icon-btn" (click)="searchOpen.set(true)" aria-label="Search">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </button>

        <!-- Account -->
        <a routerLink="/login" class="icon-btn" aria-label="Account">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
        </a>

        <!-- Wishlist -->
        <button class="icon-btn" aria-label="Wishlist">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
          </svg>
        </button>

        <!-- Cart -->
        <a routerLink="/cart" class="icon-btn" aria-label="Cart">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 01-8 0"/>
          </svg>
          @if (cart.totalItems() > 0) {
            <span class="cart-badge">{{ cart.totalItems() }}</span>
          }
        </a>

        <!-- Hamburger (mobile) -->
        <button class="hamburger" (click)="mobileOpen.set(!mobileOpen())" aria-label="Menu">
          <span [style.transform]="mobileOpen() ? 'rotate(45deg) translate(5px,5px)' : ''"></span>
          <span [style.opacity]="mobileOpen() ? '0' : '1'"></span>
          <span [style.transform]="mobileOpen() ? 'rotate(-45deg) translate(5px,-5px)' : ''"></span>
        </button>

      </div>
    </header>

    <!-- Search overlay -->
    @if (searchOpen()) {
      <div class="search-overlay" (click)="searchOpen.set(false)">
        <div class="search-box" (click)="$event.stopPropagation()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#b0a898" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" style="margin-left:1.25rem;flex-shrink:0;">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input class="search-input" type="text" placeholder="Search products, categories..."
                 [(ngModel)]="searchQuery"
                 (keyup.enter)="doSearch()"
                 autofocus />
          <button class="search-close" (click)="searchOpen.set(false)">✕</button>
        </div>
      </div>
    }

    <!-- Mobile menu -->
    @if (mobileOpen()) {
      <div class="mobile-menu">
        <div class="mobile-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b0a898" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" placeholder="Search products..." [(ngModel)]="searchQuery" (keyup.enter)="doSearch(); mobileOpen.set(false)" />
        </div>
        <a routerLink="/products" [queryParams]="{category:'Clothing'}" (click)="mobileOpen.set(false)" class="mobile-link">Women <span>›</span></a>
        <a routerLink="/products" [queryParams]="{category:'Clothing'}" (click)="mobileOpen.set(false)" class="mobile-link">Men <span>›</span></a>
        <a routerLink="/products" [queryParams]="{category:'Beauty'}" (click)="mobileOpen.set(false)" class="mobile-link">Beauty <span>›</span></a>
        <a routerLink="/products" [queryParams]="{category:'Footwear'}" (click)="mobileOpen.set(false)" class="mobile-link">Footwear <span>›</span></a>
        <a routerLink="/products" [queryParams]="{category:'Accessories'}" (click)="mobileOpen.set(false)" class="mobile-link">Handbags <span>›</span></a>
        <a routerLink="/products" [queryParams]="{sort:'sale'}" (click)="mobileOpen.set(false)" class="mobile-link sale">Sale 🔥 <span>›</span></a>
        <a routerLink="/cart" (click)="mobileOpen.set(false)" class="mobile-link">
          Bag @if (cart.totalItems() > 0) { ({{ cart.totalItems() }}) } <span>›</span>
        </a>
        <a routerLink="/login" (click)="mobileOpen.set(false)" class="mobile-link">Account <span>›</span></a>
      </div>
    }

    }
  `
})
export class NavbarComponent {
  cart = inject(CartService);
  private router = inject(Router);
  mobileOpen  = signal(false);
  searchOpen  = signal(false);
  searchQuery = '';
  scrolled = false;

  isSellerRoute() {
    return this.router.url.startsWith('/seller');
  }

  @HostListener('window:scroll')
  onScroll() { this.scrolled = window.scrollY > 10; }

  @HostListener('document:keydown.escape')
  onEsc() { this.searchOpen.set(false); this.mobileOpen.set(false); }

  doSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/products'], { queryParams: { q: this.searchQuery.trim() } });
      this.searchQuery = '';
      this.searchOpen.set(false);
    }
  }

  shopCategories: string[] = [];

  constructor() {
    inject(ProductService).getCategories().subscribe(c => this.shopCategories = c);
  }
}
