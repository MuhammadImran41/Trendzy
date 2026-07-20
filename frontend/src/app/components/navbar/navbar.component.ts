import { Component, inject, signal, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  styles: [`
    :host { display: block; }

    /* ── Topbar ── */
    .topbar {
      position: fixed; top: 0; left: 0; right: 0; z-index: 101;
      background: #1a1410; color: #c9a96e;
      text-align: center; padding: 0.45rem 1rem;
      font-family: 'Inter', sans-serif; font-size: 0.72rem; letter-spacing: 0.1em;
    }

    /* ── Outer wrapper — full width, floats over page ── */
    .nav-outer {
      position: fixed; top: 34px; left: 0; right: 0; z-index: 100;
      display: flex; justify-content: center;
      padding: 10px 24px;
      pointer-events: none;
    }

    /* ── The floating bar ── */
    nav {
      pointer-events: all;
      width: 100%; max-width: 1200px;
      background: #1e1e1e;
      border-radius: 999px;
      display: flex; align-items: center;
      padding: 0 8px 0 24px;
      height: 68px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.35);
      transition: box-shadow 0.3s;
    }
    nav.scrolled { box-shadow: 0 12px 40px rgba(0,0,0,0.5); }

    /* ── Logo ── */
    .logo {
      display: flex; align-items: center; gap: 10px;
      text-decoration: none; flex-shrink: 0; margin-right: 28px;
    }
    .logo-wordmark {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 20px; font-weight: 700; letter-spacing: 4px; line-height: 1;
    }
    .logo-wordmark .shop { color: #ffffff; }
    .logo-wordmark .zee {
      background: linear-gradient(135deg, #c8920a, #f5d160);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }

    /* ── Center nav links ── */
    .nav-links {
      display: flex; align-items: center; gap: 0.25rem;
      flex: 1;
    }
    .nav-link {
      font-family: 'Inter', sans-serif; font-size: 0.82rem; font-weight: 400;
      color: #d4d0cb; text-decoration: none;
      padding: 0.45rem 0.85rem; border-radius: 999px;
      transition: background 0.2s, color 0.2s;
      white-space: nowrap; background: none; border: none; cursor: pointer;
    }
    .nav-link:hover { background: rgba(255,255,255,0.1); color: #fff; }
    .nav-link.active { color: #fff; }

    /* ── Right actions ── */
    .nav-actions {
      display: flex; align-items: center; gap: 8px;
      flex-shrink: 0; margin-left: auto;
    }

    .btn-ghost {
      font-family: 'Inter', sans-serif; font-size: 0.82rem; font-weight: 400;
      color: #d4d0cb; background: none; border: none; cursor: pointer;
      padding: 0.45rem 0.85rem; border-radius: 999px;
      text-decoration: none; transition: background 0.2s, color 0.2s;
      white-space: nowrap;
    }
    .btn-ghost:hover { background: rgba(255,255,255,0.1); color: #fff; }

    .btn-primary {
      display: flex; align-items: center; gap: 6px;
      font-family: 'Inter', sans-serif; font-size: 0.82rem; font-weight: 600;
      background: #b3924e;
      color: #fff;
      border: none; cursor: pointer;
      padding: 0.5rem 1.25rem; border-radius: 999px;
      text-decoration: none; transition: filter 0.2s, box-shadow 0.2s;
      white-space: nowrap;
      box-shadow: 0 2px 14px rgba(179,146,78,0.4);
    }
    .btn-primary:hover {
      filter: brightness(1.08);
      box-shadow: 0 4px 20px rgba(179,146,78,0.6);
    }

    .cart-count {
      background: #c9a96e; color: #fff; width: 17px; height: 17px;
      border-radius: 50%; font-size: 0.6rem; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
    }

    /* ── Hamburger (mobile) ── */
    .hamburger {
      display: none; flex-direction: column; gap: 5px;
      background: none; border: none; cursor: pointer; padding: 0.4rem; margin-left: 4px;
    }
    .hamburger span { display: block; width: 22px; height: 1.5px; background: #d4d0cb; transition: all 0.3s; }

    /* ── Mobile dropdown ── */
    .mobile-menu {
      position: fixed; top: 100px; left: 12px; right: 12px;
      background: #1e1e1e; border-radius: 20px;
      padding: 1rem 1.5rem 1.5rem; z-index: 99;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    }
    .mobile-link {
      display: block; padding: 0.75rem 0; border-bottom: 1px solid rgba(255,255,255,0.07);
      font-family: 'Inter', sans-serif; font-size: 0.9rem; font-weight: 400;
      color: #d4d0cb; text-decoration: none; transition: color 0.2s;
    }
    .mobile-link:last-child { border-bottom: none; }
    .mobile-link:hover { color: #fff; }

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
          <svg width="30" height="30" viewBox="0 0 84 96" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="6" y="30" width="72" height="58" rx="8" fill="#2a2a2a"/>
            <path d="M28 30 C28 14 56 14 56 30" stroke="#c8960c" stroke-width="5.5" stroke-linecap="round" fill="none"/>
            <rect x="6" y="30" width="72" height="8" rx="4" fill="#c8960c"/>
            <text x="35" y="74" font-family="Georgia, serif" font-size="28" font-weight="700" fill="#f5d160" text-anchor="middle">T</text>
            <text x="51" y="74" font-family="Georgia, serif" font-size="28" font-weight="700" fill="#ffffff" text-anchor="middle">Z</text>
          </svg>
          <div class="logo-wordmark"><span class="shop">TREND</span><span class="zee">ZY</span></div>
        </a>

        <!-- Center links -->
        <div class="nav-links">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}" class="nav-link">Home</a>
          <a routerLink="/products" routerLinkActive="active" class="nav-link">Shop</a>
          <a routerLink="/products" [queryParams]="{sort:'new'}" class="nav-link">New Arrivals</a>
          <a routerLink="/products" [queryParams]="{sort:'sale'}" class="nav-link">Sale</a>
          <a routerLink="/try-on" routerLinkActive="active" class="nav-link" style="color:#c9a96e;">✨ Try On</a>
        </div>

        <!-- Right actions -->
        <div class="nav-actions">
          <a routerLink="/cart" class="btn-ghost">
            Bag@if (cart.totalItems() > 0) {&nbsp;<span class="cart-count">{{ cart.totalItems() }}</span>}
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

    @if (mobileOpen()) {
      <div class="mobile-menu">
        <a routerLink="/" (click)="mobileOpen.set(false)" class="mobile-link">Home</a>
        <a routerLink="/products" (click)="mobileOpen.set(false)" class="mobile-link">Shop All</a>
        <a routerLink="/products" [queryParams]="{sort:'new'}" (click)="mobileOpen.set(false)" class="mobile-link">New Arrivals</a>
        <a routerLink="/products" [queryParams]="{sort:'sale'}" (click)="mobileOpen.set(false)" class="mobile-link">Sale</a>
        <a routerLink="/cart" (click)="mobileOpen.set(false)" class="mobile-link">
          Bag @if (cart.totalItems() > 0) { ({{ cart.totalItems() }}) }
        </a>
      </div>
    }
    }
  `
})
export class NavbarComponent {
  cart = inject(CartService);
  private router = inject(Router);
  mobileOpen = signal(false);
  shopOpen = signal(false);
  activeTab = signal('Skincare');
  scrolled = false;

  isSellerRoute() {
    return this.router.url.startsWith('/seller');
  }

  @HostListener('window:scroll')
  onScroll() { this.scrolled = window.scrollY > 10; }

  shopCategories: string[] = [];

  constructor() {
    inject(ProductService).getCategories().subscribe(c => this.shopCategories = c);
  }
}
