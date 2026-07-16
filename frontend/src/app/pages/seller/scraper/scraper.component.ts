import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ProductService } from '../../../services/product.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-scraper',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
    .page-eyebrow { font-family:'Inter',sans-serif; font-size:0.65rem; font-weight:600; letter-spacing:0.25em; text-transform:uppercase; color:#c9a96e; margin-bottom:0.5rem; }
    .page-title { font-family:'DM Serif Display',serif; font-size:2.25rem; color:#1a1410; margin-bottom:0.25rem; }
    .page-sub { font-family:'Inter',sans-serif; font-size:0.82rem; color:#9e9890; margin-bottom:2rem; }
    .gold-line { height:1px; background:linear-gradient(90deg,#c9a96e,transparent); width:40px; margin-bottom:2rem; }
    .panel { background:#fff; border:1px solid #e8e0d6; padding:1.75rem; margin-bottom:1.5rem; }
    .field-label { display:block; font-family:'Inter',sans-serif; font-size:0.62rem; font-weight:600; letter-spacing:0.15em; text-transform:uppercase; color:#9e9890; margin-bottom:0.375rem; }
    .field-input { width:100%; background:#fff; border:1px solid #ddd8d0; padding:0.625rem 0.875rem; font-family:'Inter',sans-serif; font-size:0.875rem; color:#1a1410; outline:none; transition:border-color 0.2s; box-sizing:border-box; }
    .field-input:focus { border-color:#c9a96e; }
    .field-input::placeholder { color:#b0a898; }
    .field-input[readonly] { background:#f5f0e8; cursor:default; }
    .scrape-btn { display:inline-flex; align-items:center; gap:0.5rem; padding:0.75rem 2rem; background:#1a1410; color:#faf7f4; font-family:'Inter',sans-serif; font-size:0.75rem; font-weight:500; letter-spacing:0.12em; text-transform:uppercase; border:none; cursor:pointer; transition:background 0.2s; margin-top:1rem; }
    .scrape-btn:hover:not(:disabled) { background:#2d2520; }
    .scrape-btn:disabled { opacity:0.5; cursor:not-allowed; }
    .info-box { padding:0.875rem 1rem; background:#f5f0e8; border:1px solid #e8e0d6; font-family:'Inter',sans-serif; font-size:0.78rem; color:#6b6560; margin-bottom:1.5rem; line-height:1.6; }
    .profit-row { display:grid; grid-template-columns:1fr 1fr 1fr; gap:0.875rem; margin-top:1rem; }
    .result-card { padding:1rem; border:1px solid #e8e0d6; margin-bottom:0.75rem; display:flex; gap:1rem; align-items:flex-start; }
    .result-img { width:72px; height:72px; object-fit:cover; background:#f5f0e8; flex-shrink:0; }
    .result-name { font-family:'Inter',sans-serif; font-size:0.88rem; font-weight:500; color:#1a1410; margin-bottom:0.25rem; }
    .result-price { font-family:'DM Serif Display',serif; font-size:1.05rem; color:#1a1410; }
    .result-cat { font-family:'Inter',sans-serif; font-size:0.7rem; color:#9e9890; margin-top:2px; }
    .add-btn { padding:0.45rem 1rem; background:#1a1410; color:#faf7f4; border:none; font-family:'Inter',sans-serif; font-size:0.72rem; font-weight:500; cursor:pointer; white-space:nowrap; }
    .add-btn:hover:not(:disabled) { background:#2d2520; }
    .add-btn:disabled { opacity:0.5; }
    .success-pill { display:inline-flex; align-items:center; gap:0.3rem; padding:0.3rem 0.75rem; background:rgba(22,163,74,0.08); border:1px solid rgba(22,163,74,0.25); color:#16a34a; font-family:'Inter',sans-serif; font-size:0.72rem; white-space:nowrap; }
    .error-box { padding:0.75rem 1rem; background:rgba(220,38,38,0.06); border:1px solid rgba(220,38,38,0.2); font-family:'Inter',sans-serif; font-size:0.78rem; color:#dc2626; margin-top:1rem; }
    .profit-summary { margin-top:0.75rem; padding:0.625rem 0.875rem; background:#f5f0e8; border:1px solid #e8e0d6; font-family:'Inter',sans-serif; font-size:0.78rem; color:#6b6560; display:flex; gap:1.5rem; flex-wrap:wrap; }
    @keyframes spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }
  `],
  template: `
    <div style="max-width:780px;">
      <div class="page-eyebrow">Tools</div>
      <h1 class="page-title">Product Scraper</h1>
      <p class="page-sub">Paste any product URL — fetch details, set your profit, and add to store.</p>
      <div class="gold-line"></div>

      <div class="info-box">
        <strong>How it works:</strong> Paste a product link from any website (Daraz, Amazon, AliExpress etc.).
        We'll fetch the product name, image and price. Enter your cost price and profit % — sell price is calculated automatically. Then click <strong>Add to Store</strong>.
      </div>

      <div class="panel">
        <label class="field-label">Product URL *</label>
        <input class="field-input" [(ngModel)]="productUrl" type="url"
               placeholder="https://www.daraz.pk/products/..." />

        <div class="profit-row">
          <div>
            <label class="field-label">Cost Price (PKR)</label>
            <input class="field-input" [(ngModel)]="costPrice" type="number"
                   placeholder="1500" (ngModelChange)="recalc()" />
          </div>
          <div>
            <label class="field-label">Profit %</label>
            <input class="field-input" [(ngModel)]="profitPct" type="number"
                   placeholder="25" (ngModelChange)="recalc()" />
          </div>
          <div>
            <label class="field-label">Sell Price (auto)</label>
            <input class="field-input" [value]="sellPrice || ''" type="number" readonly />
          </div>
        </div>

        @if (sellPrice && costPrice) {
          <div class="profit-summary">
            <span>Sell Price: <strong style="color:#1a1410;">PKR {{ sellPrice | number }}</strong></span>
            <span>Profit: <strong style="color:#16a34a;">PKR {{ (sellPrice - costPrice) | number }}</strong></span>
            <span>Margin: <strong style="color:#c9a96e;">{{ profitPct }}%</strong></span>
          </div>
        }

        <button class="scrape-btn" (click)="scrape()" [disabled]="loading() || !productUrl">
          @if (loading()) {
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round"
                 style="animation:spin 1s linear infinite;">
              <polyline points="23 4 23 10 17 10"/>
              <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
            </svg>
            Fetching...
          } @else {
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            Fetch Product
          }
        </button>

        @if (error()) {
          <div class="error-box">{{ error() }}</div>
        }
      </div>

      <!-- Scraped result -->
      @if (scraped()) {
        <div class="panel">
          <div style="font-family:'DM Serif Display',serif;font-size:1.2rem;color:#1a1410;margin-bottom:1rem;">
            Fetched Product
          </div>
          <div class="result-card">
            @if (scraped()!.image) {
              <img [src]="scraped()!.image" class="result-img" alt="product" />
            } @else {
              <div class="result-img" style="display:flex;align-items:center;justify-content:center;color:#b0a898;font-size:0.7rem;">No image</div>
            }
            <div style="flex:1;min-width:0;">
              <div class="result-name">{{ scraped()!.name }}</div>
              <div class="result-cat">{{ scraped()!.category || 'No category detected' }}</div>
              <div class="result-price" style="margin-top:0.375rem;">
                PKR {{ (sellPrice || scraped()!.price) | number }}
              </div>
              @if (scraped()!.description) {
                <div style="font-family:'Inter',sans-serif;font-size:0.75rem;color:#9e9890;margin-top:0.375rem;line-height:1.5;">
                  {{ scraped()!.description | slice:0:120 }}...
                </div>
              }
            </div>
            <div style="flex-shrink:0;">
              @if (added()) {
                <span class="success-pill">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                       stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Added!
                </span>
              } @else {
                <button class="add-btn" (click)="addToStore()" [disabled]="adding()">
                  {{ adding() ? 'Adding...' : '+ Add to Store' }}
                </button>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class ScraperComponent {
  private http           = inject(HttpClient);
  private productService = inject(ProductService);
  private api            = environment.apiUrl;

  productUrl = '';
  costPrice  = 0;
  profitPct  = 25;
  sellPrice  = 0;

  loading = signal(false);
  adding  = signal(false);
  added   = signal(false);
  error   = signal('');
  scraped = signal<{ name: string; image: string; price: number; category: string; description: string } | null>(null);

  recalc() {
    if (this.costPrice > 0 && this.profitPct >= 0) {
      this.sellPrice = Math.round(this.costPrice * (1 + this.profitPct / 100));
    }
  }

  scrape() {
    if (!this.productUrl) return;
    this.loading.set(true);
    this.error.set('');
    this.scraped.set(null);
    this.added.set(false);

    this.http.post<any>(`${this.api}/scraper/fetch-meta`, { url: this.productUrl }).subscribe({
      next: (data) => {
        this.scraped.set({
          name:        data.name        || 'Product',
          image:       data.image       || '',
          price:       data.price       || this.costPrice,
          category:    data.category    || '',
          description: data.description || ''
        });
        if (data.price && !this.costPrice) {
          this.costPrice = data.price;
          this.recalc();
        }
        this.loading.set(false);
      },
      error: () => {
        let hostname = '';
        try { hostname = new URL(this.productUrl).hostname; } catch { hostname = 'external site'; }
        this.scraped.set({
          name: 'Product from ' + hostname,
          image: '', price: this.costPrice || 0,
          category: '', description: 'Imported from ' + this.productUrl
        });
        this.loading.set(false);
      }
    });
  }

  addToStore() {
    const s = this.scraped();
    if (!s) return;
    this.adding.set(true);
    const product = {
      name:          s.name,
      description:   s.description || 'Imported product',
      originalPrice: this.costPrice || s.price,
      sellerPrice:   this.sellPrice || s.price,
      category:      s.category    || 'Other',
      images:        s.image ? [s.image] : [],
      tags:          ['scraped'],
      stock:         20,
      isActive:      true
    };
    this.productService.addProduct(product).subscribe({
      next:  () => { this.adding.set(false); this.added.set(true); },
      error: () => { this.adding.set(false); this.error.set('Failed to add product. Check backend connection.'); }
    });
  }
}
