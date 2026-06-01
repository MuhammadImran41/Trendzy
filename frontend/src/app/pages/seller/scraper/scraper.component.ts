import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ScraperService, ScrapedProduct } from '../../../services/scraper.service';

@Component({
  selector: 'app-scraper',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="max-w-3xl">
      <h1 class="font-display text-3xl font-bold text-white mb-2">Product Scraper</h1>
      <p class="text-gray-400 font-body text-sm mb-8">Import products from Oriflame into your store</p>

      <!-- Input -->
      <div class="glass rounded-2xl p-6 mb-6">
        <label class="block text-sm font-body font-medium text-gray-300 mb-3">Oriflame Category URL</label>
        <div class="flex gap-3">
          <input [(ngModel)]="url" type="url" placeholder="https://www.oriflame.com/pk/products/catalogue..."
            class="flex-1 bg-dark-700 border border-white/10 focus:border-brand-500/60 rounded-xl px-4 py-3 text-white font-body placeholder-gray-600 outline-none transition-colors text-sm" />
          <button (click)="scrape()" [disabled]="loading() || !url"
            class="px-5 py-3 bg-brand-600 hover:bg-brand-500 disabled:opacity-40 rounded-xl font-body font-semibold text-white text-sm transition-all whitespace-nowrap">
            @if (loading()) { Scraping... } @else { 🕷️ Scrape }
          </button>
        </div>
        <p class="text-xs font-body text-gray-600 mt-2">
          Paste any Oriflame product catalogue URL. The backend will extract product data.
        </p>
      </div>

      <!-- Results -->
      @if (results().length > 0) {
        <div class="glass rounded-2xl p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-body font-semibold text-white">{{ results().length }} products found</h3>
            <button (click)="importAll()"
              class="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-xl text-sm font-body font-semibold text-white transition-all">
              Import All →
            </button>
          </div>
          <div class="space-y-3 max-h-96 overflow-y-auto">
            @for (product of results(); track product.oriflameUrl) {
              <div class="flex items-center gap-3 p-3 bg-dark-700 rounded-xl">
                <img [src]="product.images[0]" class="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                <div class="flex-1 min-w-0">
                  <p class="font-body font-medium text-white text-sm truncate">{{ product.name }}</p>
                  <p class="text-xs font-body text-gray-400">{{ product.category }} · PKR {{ product.price | number }}</p>
                </div>
                <span class="text-green-400 text-xs font-body">✓ Ready</span>
              </div>
            }
          </div>
        </div>
      }

      @if (imported()) {
        <div class="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 font-body text-sm text-center">
          ✅ {{ imported() }} products imported successfully!
        </div>
      }
    </div>
  `
})
export class ScraperComponent {
  private scraperService = inject(ScraperService);
  url = '';
  loading = signal(false);
  results = signal<ScrapedProduct[]>([]);
  imported = signal(0);

  scrape() {
    this.loading.set(true);
    this.scraperService.scrapeCategory(this.url).subscribe({
      next: (data) => { this.results.set(data); this.loading.set(false); },
      error: () => { this.loading.set(false); }
    });
  }

  importAll() {
    this.scraperService.importProducts(this.results()).subscribe({
      next: (r) => { this.imported.set(r.imported); this.results.set([]); }
    });
  }
}
