import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="border-t border-white/5 bg-dark-800 mt-24">
      <div class="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-10">

          <div class="md:col-span-2">
            <div class="flex items-center gap-2 mb-4">
              <div class="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
                <span class="text-white font-display font-bold text-sm">G</span>
              </div>
              <span class="font-display text-xl font-bold gradient-text">GlowMart</span>
            </div>
            <p class="text-gray-400 text-sm font-body leading-relaxed max-w-xs">
              Premium beauty &amp; skincare products delivered to your door. No account needed — just shop and glow.
            </p>
            <div class="flex gap-3 mt-6">
              <div class="flex items-center gap-2 px-3 py-1.5 glass rounded-full text-xs font-body text-gray-400">
                🚚 Free delivery over PKR 2000
              </div>
              <div class="flex items-center gap-2 px-3 py-1.5 glass rounded-full text-xs font-body text-gray-400">
                💳 Cash on Delivery
              </div>
            </div>
          </div>

          <div>
            <h4 class="text-sm font-body font-semibold text-white mb-4 uppercase tracking-widest">Shop</h4>
            <ul class="space-y-2 text-sm text-gray-400 font-body">
              <li><a routerLink="/products" class="hover:text-brand-400 transition-colors">All Products</a></li>
              <li><a routerLink="/products" [queryParams]="{category: 'Skincare'}" class="hover:text-brand-400 transition-colors">Skincare</a></li>
              <li><a routerLink="/products" [queryParams]="{category: 'Makeup'}" class="hover:text-brand-400 transition-colors">Makeup</a></li>
              <li><a routerLink="/products" [queryParams]="{category: 'Fragrance'}" class="hover:text-brand-400 transition-colors">Fragrance</a></li>
            </ul>
          </div>

          <div>
            <h4 class="text-sm font-body font-semibold text-white mb-4 uppercase tracking-widest">Info</h4>
            <ul class="space-y-2 text-sm text-gray-400 font-body">
              <li><span class="hover:text-brand-400 transition-colors cursor-pointer">Cash on Delivery</span></li>
              <li><span class="hover:text-brand-400 transition-colors cursor-pointer">Easy Returns</span></li>
              <li><span class="hover:text-brand-400 transition-colors cursor-pointer">WhatsApp Support</span></li>
              <li><a routerLink="/seller/login" class="hover:text-brand-400 transition-colors">Seller Login</a></li>
            </ul>
          </div>

        </div>
        <div class="mt-12 pt-8 border-t border-white/5 text-center text-xs text-gray-600 font-body">
          © 2025 GlowMart. All rights reserved. Powered with ❤️ from Pakistan.
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {}
