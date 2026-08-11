import { Component, inject, signal, HostListener } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  styles: [`
    :host { display: block; }

    /* ── Announcement bar ── */
    .topbar {
      position: fixed; top: 0; left: 0; right: 0; z-index: 300;
      background: #1a1410; color: #c9a96e;
      text-align: center; padding: 0.38rem 1rem;
      font-family: 'Inter', sans-serif; font-size: 0.68rem;
      letter-spacing: 0.14em; text-transform: uppercase;
      overflow: hidden;
    }
    .topbar-marquee {
      display: inline-flex; gap: 3rem; align-items: center;
      animation: topScroll 28s linear infinite;
      white-space: nowrap;
    }
    .topbar-marquee:hover { animation-play-state: paused; }
    @keyframes topScroll {
      0%   { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    .top-sep { color: rgba(201,169,110,0.4); margin: 0 0.5rem; }

    /* ── Nav outer wrapper ── */
    .nav-outer {
      position: fixed; top: 30px; left: 0; right: 0; z-index: 200;
      display: flex; justify-content: center;
      padding: 12px 24px;
      pointer-events: none;
      transition: top 0.3s ease;
    }
    .nav-outer.no-topbar { top: 0; }

    /* ── Floating pill nav ── */
    .nav-pill {
      pointer-events: all;
      width: 100%; max-width: 1200px;
      background: rgba(255,255,255,0.82);
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      border: 1px solid rgba(255,255,255,0.6);
      border-radius: 999px;
      display: flex; align-items: center;
      padding: 0 8px 0 28px;
      height: 62px;
      box-shadow:
        0 4px 24px rgba(26,20,16,0.08),
        0 1px 0 rgba(255,255,255,0.9) inset;
      transition: all 0.4s cubic-bezier(0.23,1,0.32,1);
      position: relative;
    }
    .nav-pill.scrolled {
      background: rgba(255,255,255,0.95);
      box-shadow:
        0 12px 40px rgba(26,20,16,0.14),
        0 1px 0 rgba(255,255,255,0.9) inset;
      border-color: rgba(232,224,214,0.8);
    }

    /* ── Logo ── */
    .logo {
      text-decoration: none; flex-shrink: 0;
      display: flex; align-items: center; gap: 0;
    }
    .logo-wordmark {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 22px; font-weight: 800; letter-spacing: 5px; line-height: 1;
    }
    .logo-wordmark .shop { color: #1a1410; }
    .logo-wordmark .zee {
      background: linear-gradient(135deg, #c8920a 0%, #f5d160 50%, #c8920a 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }

    /* ── Center nav ── */
    .nav-links {
      display: flex; align-items: center;
      position: absolute; left: 50%; transform: translateX(-50%);
      gap: 2px;
    }
    .nav-link {
      font-family: 'Inter', sans-serif; font-size: 0.75rem; font-weight: 600;
      color: #4a4540; text-decoration: none;
      padding: 0.45rem 0.875rem; border-radius: 999px;
      letter-spacing: 0.08em; text-transform: uppercase;
      white-space: nowrap;
      transition: background 0.2s, color 0.2s;
      position: relative;
    }
    .nav-link:hover { background: rgba(26,20,16,0.06); color: #1a1410; }
    .nav-link.active-cat { background: #1a1410; color: #fff; }
    .nav-link.sale { color: #c9a96e; }
    .nav-link.sale:hover { background: rgba(201,169,110,0.1); color: #8b6914; }
    .nav-link.sale.active-cat { background: linear-gradient(135deg,#c9a96e,#8b6914); color: #fff; }

    /* ── Right actions ── */
    .nav-actions {
      display: flex; align-items: center; gap: 2px;
      flex-shrink: 0; margin-left: auto;
    }
    .icon-btn {
      display: flex; align-items: center; justify-content: center;
      width: 38px; height: 38px; border-radius: 50%;
      background: none; border: none; cursor: pointer;
      color: #4a4540; text-decoration: none;
      transition: background 0.2s, color 0.2s, transform 0.2s;
      position: relative;
    }
    .icon-btn:hover { background: rgba(26,20,16,0.06); color: #1a1410; transform: scale(1.08); }

    .cart-badge {
      position: absolute; top: 1px; right: 1px;
      background: linear-gradient(135deg, #c9a96e, #8b6914);
      color: #fff; width: 16px; height: 16px;
      border-radius: 50%; font-size: 0.52rem; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
      border: 1.5px solid #fff;
      box-shadow: 0 2px 6px rgba(201,169,110,0.5);
    }

    /* ── Search overlay ── */
    .search-overlay {
      position: fixed; inset: 0; z-index: 500;
      background: rgba(26,20,16,0.4);
      backdrop-filter: blur(8px);
      display: flex; align-items: flex-start; justify-content: center;
      padding-top: 120px;
      animation: fadeIn 0.2s ease;
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    .search-box {
      background: #fff; width: 100%; max-width: 640px;
      margin: 0 1rem; border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 32px 80px rgba(0,0,0,0.2);
      display: flex; align-items: center;
      animation: slideDown 0.25s cubic-bezier(0.34,1.56,0.64,1);
    }
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-20px) scale(0.97); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    .search-input {
      flex: 1; padding: 1.125rem 1.25rem;
      font-family: 'Inter', sans-serif; font-size: 1.05rem; color: #1a1410;
      border: none; outline: none; background: none;
    }
    .search-input::placeholder { color: #b0a898; }
    .search-close {
      width: 44px; height: 44px; margin-right: 0.5rem;
      background: #f5f0e8; border: none; border-radius: 50%;
      cursor: pointer; color: #6b6560; font-size: 1rem;
      display: flex; align-items: center; justify-content: center;
      transition: background 0.2s;
    }
    .search-close:hover { background: #e8e0d6; color: #1a1410; }

    /* ── Mobile hamburger ── */
    .hamburger {
      display: none; flex-direction: column; gap: 4.5px;
      background: none; border: none; cursor: pointer;
      padding: 0.5rem; margin-left: 4px; border-radius: 50%;
      transition: background 0.2s;
    }
    .hamburger:hover { background: rgba(26,20,16,0.06); }
    .hamburger span { display: block; width: 20px; height: 1.5px; background: #1a1410; transition: all 0.3s cubic-bezier(0.23,1,0.32,1); border-radius: 99px; }

    /* ── Mobile menu ── */
    .mobile-menu {
      position: fixed; inset: 0; z-index: 499;
      background: rgba(26,20,16,0.5);
      backdrop-filter: blur(6px);
    }
    .mobile-panel {
      position: absolute; top: 0; right: 0; bottom: 0;
      width: min(340px, 85vw);
      background: #fff;
      padding: 1.5rem;
      overflow-y: auto;
      box-shadow: -20px 0 60px rgba(0,0,0,0.15);
      animation: slideIn 0.3s cubic-bezier(0.23,1,0.32,1);
    }
    @keyframes slideIn {
      from { transform: translateX(100%); }
      to   { transform: translateX(0); }
    }
    .mobile-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 2rem; padding-bottom: 1.25rem;
      border-bottom: 1px solid #f0ebe4;
    }
    .mobile-close {
      width: 36px; height: 36px; border-radius: 50%;
      background: #f5f0e8; border: none; cursor: pointer;
      font-size: 1rem; color: #6b6560;
      display: flex; align-items: center; justify-content: center;
    }
    .mobile-search-wrap {
      display: flex; align-items: center; gap: 0.625rem;
      background: #f5f0e8; border-radius: 10px;
      padding: 0.6rem 1rem; margin-bottom: 1.75rem;
    }
    .mobile-search-wrap input {
      flex: 1; border: none; background: none; outline: none;
      font-family: 'Inter', sans-serif; font-size: 0.875rem; color: #1a1410;
    }
    .mobile-search-wrap input::placeholder { color: #b0a898; }
    .mobile-link {
      display: flex; align-items: center; justify-content: space-between;
      padding: 0.875rem 0; border-bottom: 1px solid #f5f0e8;
      font-family: 'Inter', sans-serif; font-size: 0.875rem; font-weight: 600;
      color: #1a1410; text-decoration: none;
      letter-spacing: 0.06em; text-transform: uppercase;
      transition: color 0.2s, padding-left 0.2s;
    }
    .mobile-link:hover { color: #c9a96e; padding-left: 0.5rem; }
    .mobile-link.sale { color: #c9a96e; }
    .mobile-link:last-child { border-bottom: none; }
    .mobile-cart-badge {
      background: linear-gradient(135deg,#c9a96e,#8b6914);
      color: #fff; font-size: 0.65rem; font-weight: 700;
      padding: 0.2rem 0.5rem; border-radius: 99px;
    }

    /* ── Responsive ── */
    @media (max-width: 900px) {
      .nav-links { display: none; }
      .hamburger { display: flex; }
      .nav-outer { padding: 10px 12px; }
      .nav-pill { padding: 0 6px 0 18px; height: 56px; }
      .logo-wordmark { font-size: 18px; letter-spacing: 3px; }
    }
    @media (max-width: 480px) {
      .topbar { font-size: 0.58rem; padding: 0.32rem 0.5rem; }
      .nav-outer { padding: 8px 10px; top: 26px; }
      .logo-wordmark { font-size: 16px; letter-spacing: 2.5px; }
    }
  `],
  template: `
    @if (!isSellerRoute()) {

    <!-- Announcement bar -->
    <div class="topbar">
      <div class="topbar-marquee">
        <span>🚚 Free Delivery on orders over PKR 2,000</span>
        <span class="top-sep">✦</span>
        <span>💰 Cash on Delivery — Pay when you receive</span>
        <span class="top-sep">✦</span>
        <span>↩️ 7-Day Easy Returns</span>
        <span class="top-sep">✦</span>
        <span>✅ 100% Original Products</span>
        <span class="top-sep">✦</span>
        <span>🚚 Free Delivery on orders over PKR 2,000</span>
        <span class="top-sep">✦</span>
        <span>💰 Cash on Delivery — Pay when you receive</span>
        <span class="top-sep">✦</span>
        <span>↩️ 7-Day Easy Returns</span>
        <span class="top-sep">✦</span>
        <span>✅ 100% Original Products</span>
      </div>
    </div>

    <!-- Floating pill navbar -->
    <div class="nav-outer">
      <div class="nav-pill" [class.scrolled]="scrolled">

        <!-- Logo -->
        <a routerLink="/" class="logo">
          <div class="logo-wordmark"><span class="shop">SHOP</span><span class="zee">ZEE</span></div>
        </a>

        <!-- Center links -->
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
          <button class="icon-btn" (click)="searchOpen.set(true)" aria-label="Search">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>
          <a routerLink="/login" class="icon-btn" aria-label="Account">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </a>
          <button class="icon-btn" aria-label="Wishlist">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
            </svg>
          </button>
          <a routerLink="/cart" class="icon-btn" aria-label="Cart">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            @if (cart.totalItems() > 0) {
              <span class="cart-badge">{{ cart.totalItems() }}</span>
            }
          </a>
          <!-- Hamburger -->
          <button class="hamburger" (click)="mobileOpen.set(true)" aria-label="Menu">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </div>

    <!-- Search overlay -->
    @if (searchOpen()) {
      <div class="search-overlay" (click)="searchOpen.set(false)">
        <div class="search-box" (click)="$event.stopPropagation()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#b0a898" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left:1.25rem;flex-shrink:0;">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input class="search-input" type="text" placeholder="Search products, brands..."
                 [(ngModel)]="searchQuery"
                 (keyup.enter)="doSearch()"
                 autofocus />
          <button class="search-close" (click)="searchOpen.set(false)">✕</button>
        </div>
      </div>
    }

    <!-- Mobile menu panel -->
    @if (mobileOpen()) {
      <div class="mobile-menu" (click)="mobileOpen.set(false)">
        <div class="mobile-panel" (click)="$event.stopPropagation()">
          <div class="mobile-header">
            <div style="font-family:'Playfair Display',serif;font-size:18px;font-weight:800;letter-spacing:4px;">
              <span style="color:#1a1410;">SHOP</span><span style="background:linear-gradient(135deg,#c8920a,#f5d160,#c8920a);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">ZEE</span>
            </div>
            <button class="mobile-close" (click)="mobileOpen.set(false)">✕</button>
          </div>
          <div class="mobile-search-wrap">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#b0a898" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input type="text" placeholder="Search..." [(ngModel)]="searchQuery" (keyup.enter)="doSearch(); mobileOpen.set(false)" />
          </div>
          <a routerLink="/products" [queryParams]="{category:'Clothing'}" (click)="mobileOpen.set(false)" class="mobile-link">Women <span>›</span></a>
          <a routerLink="/products" [queryParams]="{category:'Clothing'}" (click)="mobileOpen.set(false)" class="mobile-link">Men <span>›</span></a>
          <a routerLink="/products" [queryParams]="{category:'Beauty'}" (click)="mobileOpen.set(false)" class="mobile-link">Beauty <span>›</span></a>
          <a routerLink="/products" [queryParams]="{category:'Footwear'}" (click)="mobileOpen.set(false)" class="mobile-link">Footwear <span>›</span></a>
          <a routerLink="/products" [queryParams]="{category:'Accessories'}" (click)="mobileOpen.set(false)" class="mobile-link">Handbags <span>›</span></a>
          <a routerLink="/products" [queryParams]="{sort:'sale'}" (click)="mobileOpen.set(false)" class="mobile-link sale">Sale 🔥 <span>›</span></a>
          <a routerLink="/cart" (click)="mobileOpen.set(false)" class="mobile-link">
            Bag
            @if (cart.totalItems() > 0) { <span class="mobile-cart-badge">{{ cart.totalItems() }}</span> }
          </a>
          <a routerLink="/login" (click)="mobileOpen.set(false)" class="mobile-link">Account <span>›</span></a>
        </div>
      </div>
    }

    }
  `
})
export class NavbarComponent {
  cart        = inject(CartService);
  private router = inject(Router);

  mobileOpen  = signal(false);
  searchOpen  = signal(false);
  searchQuery = '';
  scrolled    = false;

  isSellerRoute() { return this.router.url.startsWith('/seller'); }

  @HostListener('window:scroll')
  onScroll() { this.scrolled = window.scrollY > 20; }

  @HostListener('document:keydown.escape')
  onEsc() { this.searchOpen.set(false); this.mobileOpen.set(false); }

  doSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/products'], { queryParams: { q: this.searchQuery.trim() } });
      this.searchQuery = '';
      this.searchOpen.set(false);
      this.mobileOpen.set(false);
    }
  }
}
