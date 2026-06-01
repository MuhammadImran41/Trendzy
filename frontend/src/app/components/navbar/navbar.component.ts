import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <nav class="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">

          <!-- Logo -->
          <a routerLink="/" class="flex items-center gap-2 flex-shrink-0">
            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
              <span class="text-white font-display font-bold text-sm">G</span>
            </div>
            <span class="font-display text-xl font-bold gradient-text">GlowMart</span>
          </a>

          <!-- Desktop Nav Links -->
          <div class="hidden md:flex items-center gap-8">
            <a routerLink="/" routerLinkActive="text-brand-400" [routerLinkActiveOptions]="{exact:true}"
               class="text-sm font-body text-gray-300 hover:text-white transition-colors">Home</a>
            <a routerLink="/products" routerLinkActive="text-brand-400"
               class="text-sm font-body text-gray-300 hover:text-white transition-colors">Products</a>
            <a routerLink="/seller/login"
               class="text-sm font-body text-gray-300 hover:text-white transition-colors">Seller</a>
          </div>

          <!-- Right side: Cart + Hamburger -->
          <div class="flex items-center gap-3">
            <!-- Cart -->
            <a routerLink="/cart" class="relative flex items-center gap-2 px-4 py-2 rounded-full glass hover:border-brand-500/40 transition-all">
              <svg class="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span class="text-sm text-gray-300 font-body hidden sm:inline">Cart</span>
              @if (cart.totalItems() > 0) {
                <span class="absolute -top-1 -right-1 w-5 h-5 bg-brand-500 rounded-full text-xs flex items-center justify-center font-bold">
                  {{ cart.totalItems() }}
                </span>
              }
            </a>

            <!-- Hamburger (mobile only) -->
            <button (click)="mobileOpen.set(!mobileOpen())"
              class="md:hidden flex flex-col gap-1.5 p-2 rounded-lg glass hover:border-white/20 transition-all"
              aria-label="Toggle menu">
              <span class="w-5 h-0.5 bg-gray-300 transition-all duration-300"
                [class.rotate-45]="mobileOpen()" [class.translate-y-2]="mobileOpen()"></span>
              <span class="w-5 h-0.5 bg-gray-300 transition-all duration-300"
                [class.opacity-0]="mobileOpen()"></span>
              <span class="w-5 h-0.5 bg-gray-300 transition-all duration-300"
                [class.-rotate-45]="mobileOpen()" [class.-translate-y-2]="mobileOpen()"></span>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile Menu -->
      @if (mobileOpen()) {
        <div class="md:hidden border-t border-white/5 bg-dark-800/95 backdrop-blur-xl px-4 py-4 space-y-1">
          <a routerLink="/" (click)="mobileOpen.set(false)"
             routerLinkActive="text-brand-400 bg-brand-500/10" [routerLinkActiveOptions]="{exact:true}"
             class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-body text-gray-300 hover:text-white hover:bg-white/5 transition-all">
            🏠 Home
          </a>
          <a routerLink="/products" (click)="mobileOpen.set(false)"
             routerLinkActive="text-brand-400 bg-brand-500/10"
             class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-body text-gray-300 hover:text-white hover:bg-white/5 transition-all">
            🛍️ Products
          </a>
          <a routerLink="/cart" (click)="mobileOpen.set(false)"
             routerLinkActive="text-brand-400 bg-brand-500/10"
             class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-body text-gray-300 hover:text-white hover:bg-white/5 transition-all">
            🛒 Cart
            @if (cart.totalItems() > 0) {
              <span class="ml-auto px-2 py-0.5 bg-brand-500 rounded-full text-xs font-bold text-white">{{ cart.totalItems() }}</span>
            }
          </a>
          <a routerLink="/seller/login" (click)="mobileOpen.set(false)"
             class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-body text-gray-400 hover:text-white hover:bg-white/5 transition-all">
            💎 Seller Login
          </a>
        </div>
      }
    </nav>
  `
})
export class NavbarComponent {
  cart = inject(CartService);
  mobileOpen = signal(false);
}
