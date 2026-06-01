import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

interface ScrapedProduct {
  name: string; description: string;
  originalPrice: number; sellerPrice: number;
  images: string[]; category: string; tags: string[];
  stock: number; oriflameUrl: string; reviewCount?: number;
}

@Component({
  selector: 'app-scraper',
  standalone: true,
  imports: [FormsModule, CommonModule],
  styles: [`
    .page-eyebrow { font-family:'Jost',sans-serif; font-size:0.65rem; font-weight:600; letter-spacing:0.25em; text-transform:uppercase; color:#c9a96e; margin-bottom:0.5rem; }
    .page-title   { font-family:'Cormorant Garamond',Georgia,serif; font-size:2.25rem; font-weight:400; color:#1a1410; margin-bottom:0.25rem; }
    .page-sub     { font-family:'Jost',sans-serif; font-size:0.82rem; color:#9e9890; margin-bottom:2rem; }
    .gold-line    { height:1px; background:linear-gradient(90deg,#c9a96e,transparent); width:40px; margin-bottom:2rem; }

    .panel { background:#fff; border:1px solid #e8e0d6; padding:1.75rem; margin-bottom:1px; }

    .section-label { font-family:'Jost',sans-serif; font-size:0.62rem; font-weight:600; letter-spacing:0.2em; text-transform:uppercase; color:#9e9890; margin-bottom:0.875rem; }

    /* ── Category buttons ── */
    .cat-grid { display:flex; flex-wrap:wrap; gap:0.5rem; margin-bottom:1.5rem; }
    .cat-btn {
      padding:0.4rem 1rem;
      background:#fff; border:1px solid #ddd8d0;
      font-family:'Jost',sans-serif; font-size:0.75rem; font-weight:500;
      color:#6b6560; cursor:pointer; transition:all 0.2s;
    }
    .cat-btn:hover { border-color:#1a1410; color:#1a1410; }
    .cat-btn.active { background:#1a1410; border-color:#1a1410; color:#faf7f4; }
    .cat-btn.all-btn.active { background:linear-gradient(135deg,#c9a96e,#8b6914); border-color:#c9a96e; color:#fff; }

    /* ── Inputs ── */
    .field-label { display:block; font-family:'Jost',sans-serif; font-size:0.62rem; font-weight:600; letter-spacing:0.15em; text-transform:uppercase; color:#9e9890; margin-bottom:0.375rem; }
    .field-input {
      background:#fff; border:1px solid #ddd8d0;
      padding:0.5rem 0.875rem;
      font-family:'Jost',sans-serif; font-size:0.85rem; color:#1a1410;
      outline:none; transition:border-color 0.2s;
    }
    .field-input::placeholder { color:#b0a898; }
    .field-input:focus { border-color:#c9a96e; }

    .max-row { display:flex; align-items:center; gap:1rem; margin-bottom:1.5rem; }

    /* ── Start button ── */
    .start-btn {
      display:inline-flex; align-items:center; gap:0.625rem;
      padding:0.75rem 2rem;
      background:#1a1410; color:#faf7f4;
      font-family:'Jost',sans-serif; font-size:0.75rem; font-weight:500;
      letter-spacing:0.12em; text-transform:uppercase;
      border:none; cursor:pointer; transition:background 0.2s;
    }
    .start-btn:hover:not(:disabled) { background:#2d2520; }
    .start-btn:disabled { opacity:0.5; cursor:not-allowed; }

    /* ── Progress ── */
    .progress-wrap { margin-top:1rem; }
    .progress-bar  { height:2px; background:#e8e0d6; overflow:hidden; }
    .progress-fill { height:100%; background:linear-gradient(90deg,#c9a96e,#8b6914); animation:progress-anim 1.5s ease-in-out infinite; }
    @keyframes progress-anim { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }
    .progress-text { font-family:'Jost',sans-serif; font-size:0.72rem; color:#9e9890; margin-top:0.5rem; }

    /* ── Error / success ── */
    .error-box   { padding:0.75rem 1rem; background:rgba(220,38,38,0.06); border:1px solid rgba(220,38,38,0.2); font-family:'Jost',sans-serif; font-size:0.8rem; color:#dc2626; margin-top:1rem; }
    .success-box { display:flex; align-items:center; gap:0.625rem; padding:0.875rem 1rem; background:rgba(22,163,74,0.06); border:1px solid rgba(22,163,74,0.2); font-family:'Jost',sans-serif; font-size:0.82rem; color:#16a34a; margin-top:1rem; }

    /* ── Results panel ── */
    .results-header { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:0.75rem; margin-bottom:1.25rem; }
    .results-title  { font-family:'Cormorant Garamond',serif; font-size:1.25rem; font-weight:500; color:#1a1410; }
    .results-sub    { font-family:'Jost',sans-serif; font-size:0.75rem; color:#9e9890; margin-top:0.125rem; }

    .results-actions { display:flex; gap:0.5rem; }
    .btn-clear  { padding:0.4rem 0.875rem; background:#fff; border:1px solid #ddd8d0; font-family:'Jost',sans-serif; font-size:0.75rem; color:#6b6560; cursor:pointer; transition:all 0.2s; }
    .btn-clear:hover { border-color:#1a1410; color:#1a1410; }
    .btn-import { display:flex; align-items:center; gap:0.375rem; padding:0.4rem 1rem; background:#1a1410; border:none; font-family:'Jost',sans-serif; font-size:0.75rem; font-weight:500; color:#faf7f4; cursor:pointer; transition:background 0.2s; }
    .btn-import:hover:not(:disabled) { background:#2d2520; }
    .btn-import:disabled { opacity:0.5; cursor:not-allowed; }

    .cat-breakdown { display:flex; flex-wrap:wrap; gap:0.375rem; margin-bottom:1rem; }
    .cat-chip { padding:0.2rem 0.625rem; background:#f5f0e8; border:1px solid #e8e0d6; font-family:'Jost',sans-serif; font-size:0.7rem; color:#9e9890; }

    .product-list { max-height:480px; overflow-y:auto; }
    .product-row  { display:flex; align-items:center; gap:0.875rem; padding:0.75rem 0; border-bottom:1px solid #f0ebe4; }
    .product-row:last-child { border-bottom:none; }
    .product-img  { width:44px; height:44px; object-fit:cover; background:#f5f0e8; flex-shrink:0; }
    .product-name { font-family:'Jost',sans-serif; font-size:0.82rem; font-weight:500; color:#1a1410; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .product-cat  { font-family:'Jost',sans-serif; font-size:0.7rem; color:#9e9890; margin-top:1px; }
    .product-price { font-family:'Cormorant Garamond',serif; font-size:1rem; font-weight:600; color:#1a1410; white-space:nowrap; }
    .product-orig  { font-family:'Jost',sans-serif; font-size:0.72rem; color:#b0a898; text-decoration:line-through; margin-left:0.25rem; }
    .sold-out-tag  { font-family:'Jost',sans-serif; font-size:0.65rem; color:#dc2626; margin-top:1px; }
    .ext-link      { color:#b0a898; flex-shrink:0; transition:color 0.2s; }
    .ext-link:hover { color:#c9a96e; }

    @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  `],
  template: `
    <div style="max-width:860px;">
      <div class="page-eyebrow">Oriflame</div>
      <h1 class="page-title">Product Scraper</h1>
      <p class="page-sub">
        Import products directly from
        <a href="https://www.oriflame.com.pk" target="_blank" style="color:#c9a96e;text-decoration:none;">oriflame.com.pk ↗</a>
      </p>
      <div class="gold-line"></div>

      <!-- Local backend notice -->
      <div style="padding:0.875rem 1.25rem;background:#f5f0e8;border:1px solid #e8e0d6;margin-bottom:1.5rem;display:flex;align-items:flex-start;gap:0.75rem;">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#c9a96e" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;margin-top:1px;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <div>
          <div style="font-family:'Jost',sans-serif;font-size:0.78rem;font-weight:500;color:#1a1410;margin-bottom:0.125rem;">Local Backend Required for Scraping</div>
          <div style="font-family:'Jost',sans-serif;font-size:0.75rem;color:#9e9890;">
            Scraper runs on your local machine. Start backend first:
            <code style="background:#e8e0d6;padding:0.1rem 0.375rem;font-family:'JetBrains Mono',monospace;font-size:0.72rem;color:#1a1410;">python -m uvicorn app.main:app --port 8000</code>
          </div>
        </div>
      </div>

      <!-- Config panel -->
      <div class="panel">
        <div class="section-label">Select Category</div>
        <div class="cat-grid">
          <button class="cat-btn all-btn" [class.active]="selectedCategory === 'All'" (click)="selectedCategory = 'All'">
            All Categories
          </button>
          @for (cat of categories; track cat) {
            <button class="cat-btn" [class.active]="selectedCategory === cat" (click)="selectedCategory = cat">
              {{ cat }}
            </button>
          }
        </div>

        <div style="margin-bottom:1.25rem;">
          <label class="field-label">Or paste a custom Oriflame URL</label>
          <input class="field-input" style="width:100%;" [(ngModel)]="customUrl" type="url"
            placeholder="https://www.oriflame.com.pk/skincare"
            (focus)="selectedCategory = ''" />
        </div>

        <div class="max-row">
          <label class="field-label" style="margin:0;white-space:nowrap;">Max products per category</label>
          <select class="field-input" [(ngModel)]="maxProducts" style="width:auto;">
            <option [value]="20">20</option>
            <option [value]="50">50</option>
            <option [value]="100">100</option>
          </select>
        </div>

        <button class="start-btn" (click)="scrape()" [disabled]="loading()">
          @if (loading()) {
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation:spin 1s linear infinite;">
              <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
            </svg>
            Scraping...
          } @else {
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            Start Scraping
          }
        </button>

        @if (loading()) {
          <div class="progress-wrap">
            <div class="progress-bar"><div class="progress-fill"></div></div>
            <div class="progress-text">Playwright is loading Oriflame pages — this may take 30–60 seconds</div>
          </div>
        }

        @if (error()) {
          <div class="error-box">{{ error() }}</div>
        }
      </div>

      <!-- Results -->
      @if (results().length > 0) {
        <div class="panel" style="margin-top:1px;">
          <div class="results-header">
            <div>
              <div class="results-title">{{ results().length }} products found</div>
              <div class="results-sub">Review below, then import to your store</div>
            </div>
            <div class="results-actions">
              <button class="btn-clear" (click)="results.set([])">Clear</button>
              <button class="btn-import" (click)="importAll()" [disabled]="importing()">
                @if (importing()) { Importing... }
                @else {
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Import All to Store
                }
              </button>
            </div>
          </div>

          <div class="cat-breakdown">
            @for (cat of getCategoryBreakdown(); track cat.name) {
              <span class="cat-chip">{{ cat.name }}: {{ cat.count }}</span>
            }
          </div>

          <div class="product-list">
            @for (p of results(); track p.oriflameUrl) {
              <div class="product-row">
                <img [src]="p.images[0] || ''" class="product-img" [alt]="p.name" />
                <div style="flex:1;min-width:0;">
                  <div class="product-name">{{ p.name }}</div>
                  <div class="product-cat">{{ p.category }}</div>
                </div>
                <div style="text-align:right;flex-shrink:0;">
                  <div>
                    <span class="product-price">PKR {{ p.sellerPrice | number }}</span>
                    @if (p.originalPrice > p.sellerPrice) {
                      <span class="product-orig">{{ p.originalPrice | number }}</span>
                    }
                  </div>
                  @if (p.stock === 0) { <div class="sold-out-tag">Sold Out</div> }
                </div>
                <a [href]="p.oriflameUrl" target="_blank" class="ext-link" title="View on Oriflame">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/>
                  </svg>
                </a>
              </div>
            }
          </div>
        </div>
      }

      @if (importResult()) {
        <div class="success-box">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          {{ importResult()!.imported }} products imported successfully!
          @if (importResult()!.skipped > 0) {
            <span style="color:#9e9890;font-size:0.78rem;">({{ importResult()!.skipped }} skipped — already in store)</span>
          }
        </div>
      }
    </div>
  `
})
export class ScraperComponent {
  private http    = inject(HttpClient);
  private apiUrl  = 'https://glow-mart-production.up.railway.app/api';
  private localUrl = 'http://localhost:8000/api';

  // Use local backend for scraping (Playwright runs locally)
  // Use production for import (saves to real DB)
  get scraperApi() { return this.localUrl; }
  get importApi()  { return this.apiUrl; }

  categories      = ['Skincare', 'Makeup', 'Fragrance', 'Haircare', 'Body'];
  selectedCategory = 'Skincare';
  customUrl       = '';
  maxProducts     = 50;

  loading      = signal(false);
  importing    = signal(false);
  results      = signal<ScrapedProduct[]>([]);
  error        = signal('');
  importResult = signal<{ imported: number; skipped: number } | null>(null);

  scrape() {
    this.loading.set(true); this.error.set(''); this.results.set([]); this.importResult.set(null);

    // Map category name to Oriflame PK URL for production API compatibility
    const categoryUrls: Record<string, string> = {
      'Skincare':  'https://www.oriflame.com.pk/skincare',
      'Makeup':    'https://www.oriflame.com.pk/makeup',
      'Fragrance': 'https://www.oriflame.com.pk/fragrance',
      'Haircare':  'https://www.oriflame.com.pk/hair-care',
      'Body':      'https://www.oriflame.com.pk/body',
    };

    if (this.selectedCategory === 'All' && !this.customUrl) {
      // Scrape all categories sequentially
      this._scrapeAll(categoryUrls);
      return;
    }

    const url = this.customUrl || categoryUrls[this.selectedCategory] || '';
    if (!url) { this.error.set('Please select a category or enter a URL.'); this.loading.set(false); return; }

    this.http.post<any[]>(`${this.scraperApi}/scraper/scrape`, { url }).subscribe({
      next: (data) => {
        if (!Array.isArray(data)) this.error.set((data as any).error || 'No products returned.');
        else if (data.length === 0) this.error.set('No products found. Try a different URL or category.');
        else this.results.set(data);
        this.loading.set(false);
      },
      error: (err) => { this.error.set(err?.error?.detail || 'Scraper failed. Make sure local backend is running on port 8000.'); this.loading.set(false); }
    });
  }

  private _scrapeAll(categoryUrls: Record<string, string>) {
    const cats = Object.values(categoryUrls);
    const allResults: any[] = [];
    let idx = 0;

    const scrapeNext = () => {
      if (idx >= cats.length) {
        if (allResults.length === 0) this.error.set('No products found across all categories.');
        else this.results.set(allResults);
        this.loading.set(false);
        return;
      }
      const url = cats[idx++];
      this.http.post<any[]>(`${this.scraperApi}/scraper/scrape`, { url }).subscribe({
        next: (data) => { if (Array.isArray(data)) allResults.push(...data); scrapeNext(); },
        error: () => scrapeNext()
      });
    };
    scrapeNext();
  }

  importAll() {
    this.importing.set(true);
    this.importResult.set(null);
    this.error.set('');

    this.http.post<any>(`${this.importApi}/scraper/import`, { products: this.results() }).subscribe({
      next: (r) => {
        this.importResult.set({
          imported: r.imported ?? r.count ?? 0,
          skipped:  r.skipped ?? 0
        });
        this.results.set([]);
        this.importing.set(false);
      },
      error: (err) => {
        // Fallback: try local backend import
        this.http.post<any>(`${this.localUrl}/scraper/import`, { products: this.results() }).subscribe({
          next: (r) => {
            this.importResult.set({ imported: r.imported ?? 0, skipped: r.skipped ?? 0 });
            this.results.set([]);
            this.importing.set(false);
          },
          error: (e) => {
            this.error.set('Import failed: ' + (e?.error?.detail || e?.message || 'Unknown error'));
            this.importing.set(false);
          }
        });
      }
    });
  }

  getCategoryBreakdown() {
    const map: Record<string, number> = {};
    for (const p of this.results()) map[p.category] = (map[p.category] || 0) + 1;
    return Object.entries(map).map(([name, count]) => ({ name, count }));
  }
}
