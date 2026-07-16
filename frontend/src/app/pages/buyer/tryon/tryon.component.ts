import { Component, OnInit, inject, signal, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'app-tryon',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  styles: [`
    .page { max-width: 1100px; margin: 0 auto; padding: 2rem 1.5rem; }
    .page-header { text-align: center; margin-bottom: 3rem; }
    .eyebrow { font-family:'Inter',sans-serif; font-size:0.7rem; font-weight:600; letter-spacing:0.25em; text-transform:uppercase; color:#c9a96e; margin-bottom:0.75rem; }
    .page-title { font-family:'DM Serif Display',serif; font-size:clamp(2rem,4vw,3rem); font-weight:400; color:#1a1410; margin-bottom:0.5rem; }
    .page-title em { font-style:italic; }
    .page-sub { font-family:'Inter',sans-serif; font-size:0.9rem; color:#9e9890; }

    .grid { display:grid; grid-template-columns:1fr 1fr; gap:2rem; }
    @media(max-width:768px) { .grid { grid-template-columns:1fr; } }

    /* ── Upload box ── */
    .upload-box {
      border: 2px dashed #e8e0d6; border-radius:16px; padding:2rem;
      text-align:center; cursor:pointer; transition:all 0.2s; background:#faf7f4;
      position:relative; min-height:280px; display:flex; flex-direction:column;
      align-items:center; justify-content:center;
    }
    .upload-box:hover, .upload-box.dragover { border-color:#c9a96e; background:#fff; }
    .upload-box input { position:absolute; inset:0; opacity:0; cursor:pointer; }
    .upload-icon { font-size:2.5rem; margin-bottom:1rem; }
    .upload-title { font-family:'DM Serif Display',serif; font-size:1.2rem; color:#1a1410; margin-bottom:0.5rem; }
    .upload-sub { font-family:'Inter',sans-serif; font-size:0.8rem; color:#9e9890; }
    .upload-note { font-family:'Inter',sans-serif; font-size:0.72rem; color:#b0a898; margin-top:0.5rem; }
    .preview-img { width:100%; max-height:300px; object-fit:contain; border-radius:12px; }

    /* ── Product selector ── */
    .section-label { font-family:'Inter',sans-serif; font-size:0.72rem; font-weight:600; letter-spacing:0.12em; text-transform:uppercase; color:#6b6560; margin-bottom:1rem; }
    .products-scroll { display:grid; grid-template-columns:repeat(3,1fr); gap:0.75rem; max-height:340px; overflow-y:auto; padding-right:4px; }
    .prod-card {
      border:2px solid #e8e0d6; border-radius:10px; overflow:hidden; cursor:pointer;
      transition:all 0.2s; background:#fff;
    }
    .prod-card:hover { border-color:#c9a96e; transform:translateY(-2px); }
    .prod-card.selected { border-color:#c9a96e; box-shadow:0 0 0 2px rgba(201,169,110,0.3); }
    .prod-card img { width:100%; height:90px; object-fit:cover; display:block; }
    .prod-name { font-family:'Inter',sans-serif; font-size:0.65rem; color:#1a1410; padding:6px 8px; line-height:1.3; font-weight:500; }

    /* ── Action section ── */
    .action-section { margin-top:2rem; }
    .selected-info {
      background:#f5f0e8; border:1px solid #e8e0d6; border-radius:10px;
      padding:1rem 1.25rem; margin-bottom:1.25rem; display:flex; align-items:center; gap:1rem;
    }
    .selected-info img { width:48px; height:48px; object-fit:cover; border-radius:8px; }
    .selected-name { font-family:'DM Serif Display',serif; font-size:1rem; color:#1a1410; }
    .selected-sub { font-family:'Inter',sans-serif; font-size:0.75rem; color:#9e9890; margin-top:2px; }

    .btn-tryon {
      width:100%; padding:1rem; background:linear-gradient(135deg,#1a1410,#2d2520);
      color:#faf7f4; border:none; border-radius:12px; font-family:'Inter',sans-serif;
      font-size:0.9rem; font-weight:600; letter-spacing:0.1em; text-transform:uppercase;
      cursor:pointer; transition:all 0.3s; display:flex; align-items:center; justify-content:center; gap:0.75rem;
    }
    .btn-tryon:hover:not(:disabled) { background:linear-gradient(135deg,#c9a96e,#a0782a); transform:translateY(-1px); box-shadow:0 8px 24px rgba(201,169,110,0.3); }
    .btn-tryon:disabled { opacity:0.5; cursor:not-allowed; transform:none; }

    /* ── Loading ── */
    .loading-section { text-align:center; padding:3rem 2rem; }
    .spinner { width:56px; height:56px; border:3px solid #f0ebe4; border-top-color:#c9a96e; border-radius:50%; animation:spin 0.8s linear infinite; margin:0 auto 1.5rem; }
    @keyframes spin { to { transform:rotate(360deg); } }
    .loading-title { font-family:'DM Serif Display',serif; font-size:1.4rem; color:#1a1410; margin-bottom:0.5rem; }
    .loading-steps { font-family:'Inter',sans-serif; font-size:0.82rem; color:#9e9890; }

    /* ── Result ── */
    .result-section { margin-top:2rem; }
    .result-card { background:#fff; border:1px solid #e8e0d6; border-radius:16px; overflow:hidden; box-shadow:0 8px 32px rgba(26,20,16,0.08); }
    .result-header { background:linear-gradient(135deg,#1a1410,#2d2520); padding:1.25rem 1.5rem; display:flex; align-items:center; gap:0.75rem; }
    .result-header-text { font-family:'DM Serif Display',serif; font-size:1.1rem; color:#faf7f4; }
    .result-header-sub { font-family:'Inter',sans-serif; font-size:0.75rem; color:#c9a96e; margin-top:2px; }
    .result-img { width:100%; max-height:500px; object-fit:contain; display:block; background:#faf7f4; }
    .result-actions { padding:1.25rem 1.5rem; display:flex; gap:0.75rem; flex-wrap:wrap; border-top:1px solid #f0ebe4; }
    .btn-download {
      flex:1; padding:0.75rem; background:#c9a96e; color:#1a1410; border:none; border-radius:8px;
      font-family:'Inter',sans-serif; font-size:0.8rem; font-weight:700; letter-spacing:0.08em;
      text-transform:uppercase; cursor:pointer; transition:background 0.2s; text-align:center; text-decoration:none;
      display:flex; align-items:center; justify-content:center; gap:0.5rem;
    }
    .btn-download:hover { background:#a0782a; }
    .btn-retry { flex:1; padding:0.75rem; background:#faf7f4; color:#1a1410; border:1px solid #e8e0d6; border-radius:8px; font-family:'Inter',sans-serif; font-size:0.8rem; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; cursor:pointer; transition:all 0.2s; }
    .btn-retry:hover { border-color:#c9a96e; color:#c9a96e; }

    /* ── Error ── */
    .error-box { background:#fef2f2; border:1px solid #fecaca; color:#dc2626; border-radius:10px; padding:1rem 1.25rem; font-family:'Inter',sans-serif; font-size:0.85rem; margin-top:1rem; }

    /* ── Steps banner ── */
    .steps { display:flex; gap:0; margin-bottom:2.5rem; background:#fff; border:1px solid #e8e0d6; border-radius:12px; overflow:hidden; }
    .step { flex:1; padding:1rem; text-align:center; border-right:1px solid #f0ebe4; }
    .step:last-child { border-right:none; }
    .step-num { width:28px; height:28px; background:#1a1410; color:#c9a96e; border-radius:50%; font-family:'DM Serif Display',serif; font-size:0.95rem; display:flex; align-items:center; justify-content:center; margin:0 auto 0.5rem; }
    .step-text { font-family:'Inter',sans-serif; font-size:0.72rem; color:#6b6560; }
    @media(max-width:500px) { .steps { flex-direction:column; } .step { border-right:none; border-bottom:1px solid #f0ebe4; } }
  `],
  template: `
    <div class="page">
      <div class="page-header">
        <div class="eyebrow">AI Powered</div>
        <h1 class="page-title">Virtual <em>Try-On</em></h1>
        <p class="page-sub">See how clothes look on you before buying — powered by Gemini AI</p>
      </div>

      <!-- Steps -->
      <div class="steps">
        <div class="step">
          <div class="step-num">1</div>
          <div class="step-text">Upload your photo</div>
        </div>
        <div class="step">
          <div class="step-num">2</div>
          <div class="step-text">Select a product</div>
        </div>
        <div class="step">
          <div class="step-num">3</div>
          <div class="step-text">Click Try It On</div>
        </div>
        <div class="step">
          <div class="step-num">4</div>
          <div class="step-text">See the result!</div>
        </div>
      </div>

      <!-- Loading state -->
      @if (loading()) {
        <div class="loading-section">
          <div class="spinner"></div>
          <div class="loading-title">Generating your look...</div>
          <div class="loading-steps">Gemini AI is analyzing your photo and applying the outfit.<br>This may take 15–30 seconds.</div>
        </div>
      }

      @if (!loading()) {
        <div class="grid">

          <!-- LEFT: Upload + Product select -->
          <div>
            <div class="section-label">Step 1 — Your Photo</div>
            <div class="upload-box" [class.dragover]="isDragging()"
                 (dragover)="$event.preventDefault(); isDragging.set(true)"
                 (dragleave)="isDragging.set(false)"
                 (drop)="onDrop($event)">
              <input type="file" accept="image/jpeg,image/png,image/webp"
                     (change)="onPhotoSelect($event)" />
              @if (userPhotoUrl()) {
                <img [src]="userPhotoUrl()" class="preview-img" alt="Your photo" />
              } @else {
                <div class="upload-icon">🤳</div>
                <div class="upload-title">Upload Your Photo</div>
                <div class="upload-sub">Drag & drop or click to browse</div>
                <div class="upload-note">JPEG, PNG or WebP · Max 5MB · Face clearly visible</div>
              }
            </div>
            @if (userPhotoUrl()) {
              <div style="text-align:center;margin-top:0.75rem;">
                <button (click)="clearPhoto()" style="font-family:'Inter',sans-serif;font-size:0.75rem;color:#9e9890;background:none;border:none;cursor:pointer;text-decoration:underline;">
                  Remove photo
                </button>
              </div>
            }

            <div style="margin-top:1.75rem;">
              <div class="section-label">Step 2 — Select Product</div>
              @if (products().length === 0) {
                <div style="text-align:center;padding:2rem;color:#b0a898;font-family:'Inter',sans-serif;font-size:0.85rem;">
                  Loading products...
                </div>
              }
              <div class="products-scroll">
                @for (p of products(); track p.id) {
                  <div class="prod-card" [class.selected]="selectedProduct()?.id === p.id"
                       (click)="selectedProduct.set(p)">
                    <img [src]="(p.images && p.images.length > 0) ? p.images[0] : 'https://via.placeholder.com/150'"
                         [alt]="p.name" loading="lazy" />
                    <div class="prod-name">{{ p.name }}</div>
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- RIGHT: Action + Result -->
          <div>
            <div class="action-section">
              @if (selectedProduct()) {
                <div class="selected-info">
                  <img [src]="(selectedProduct()!.images && selectedProduct()!.images.length > 0) ? selectedProduct()!.images[0] : ''"
                       [alt]="selectedProduct()!.name" />
                  <div>
                    <div class="selected-name">{{ selectedProduct()!.name }}</div>
                    <div class="selected-sub">PKR {{ selectedProduct()!.sellerPrice | number }}</div>
                  </div>
                </div>
              }

              <button class="btn-tryon"
                      [disabled]="!userPhotoFile() || !selectedProduct()"
                      (click)="generateTryOn()">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="3"/><path d="M20.188 10.934c.2.643.312 1.354.312 2.066s-.112 1.423-.312 2.066m-16.376 0A10.186 10.186 0 013.5 12.998c0-.712.112-1.423.312-2.066m16.376-3.867A10 10 0 0012 2c-2.687 0-5.12 1.053-6.938 2.768M3.812 9.067A10 10 0 002 13c0 5.523 4.477 10 10 10s10-4.477 10-10c0-1.227-.22-2.4-.625-3.485"/>
                </svg>
                @if (!userPhotoFile() || !selectedProduct()) {
                  {{ !userPhotoFile() ? 'Upload a photo first' : 'Select a product first' }}
                } @else {
                  ✨ Try It On
                }
              </button>

              @if (!userPhotoFile() || !selectedProduct()) {
                <div style="text-align:center;font-family:'Inter',sans-serif;font-size:0.75rem;color:#b0a898;margin-top:0.75rem;">
                  Complete both steps above to try on
                </div>
              }
            </div>

            @if (error()) {
              <div class="error-box">
                ⚠️ {{ error() }}
              </div>
            }

    // Result
    @if (resultUrl()) {
      <div class="result-section">
        <div class="result-card">
          <div class="result-header">
            <div>
              <div class="result-header-text">✨ Your Try-On Result</div>
              <div class="result-header-sub">{{ resultProductName() }}</div>
            </div>
          </div>
          <img [src]="resultUrl()" class="result-img" alt="Try-on result" />

          <!-- AI Analysis -->
          @if (analysis()) {
            <div style="padding:1.25rem 1.5rem;background:#faf7f4;border-top:1px solid #f0ebe4;">
              <div style="display:flex;gap:1rem;margin-bottom:1rem;flex-wrap:wrap;">
                <div style="background:#1a1410;color:#c9a96e;padding:0.4rem 1rem;border-radius:99px;font-family:'Inter',sans-serif;font-size:0.75rem;font-weight:700;">
                  Fit Score: {{ analysis()?.fit_score }}/10
                </div>
                <div style="background:#f5f0e8;color:#1a1410;padding:0.4rem 1rem;border-radius:99px;font-family:'Inter',sans-serif;font-size:0.75rem;font-weight:600;">
                  {{ analysis()?.style_match }} Match
                </div>
                <div style="background:#f5f0e8;color:#6b6560;padding:0.4rem 1rem;border-radius:99px;font-family:'Inter',sans-serif;font-size:0.75rem;">
                  {{ analysis()?.occasion }}
                </div>
              </div>
              <p style="font-family:'Inter',sans-serif;font-size:0.85rem;color:#1a1410;font-weight:600;margin:0 0 0.5rem;">How it looks on you:</p>
              <p style="font-family:'Inter',sans-serif;font-size:0.82rem;color:#6b6560;line-height:1.7;margin:0 0 1rem;">{{ analysis()?.how_it_looks }}</p>
              @if (analysis()?.styling_tips?.length) {
                <p style="font-family:'Inter',sans-serif;font-size:0.82rem;font-weight:600;color:#1a1410;margin:0 0 0.4rem;">Styling Tips:</p>
                <ul style="font-family:'Inter',sans-serif;font-size:0.8rem;color:#6b6560;line-height:1.8;margin:0;padding-left:1.25rem;">
                  @for (tip of analysis()?.styling_tips; track tip) {
                    <li>{{ tip }}</li>
                  }
                </ul>
              }
            </div>
          }

          <div class="result-actions">
            <a [href]="resultUrl()" [download]="'trendzy-tryon.jpg'" class="btn-download">
              ⬇ Download
            </a>
            <button class="btn-retry" (click)="resultUrl.set(''); analysis.set(null); error.set('')">
              Try Another
            </button>
          </div>
        </div>
      </div>
    }

            <!-- Tips -->
            @if (!resultUrl()) {
              <div style="margin-top:2rem;background:#faf7f4;border:1px solid #e8e0d6;border-radius:12px;padding:1.25rem;">
                <div style="font-family:'Inter',sans-serif;font-size:0.72rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#c9a96e;margin-bottom:0.75rem;">Tips for best results</div>
                <ul style="font-family:'Inter',sans-serif;font-size:0.8rem;color:#6b6560;line-height:1.9;padding-left:1.25rem;margin:0;">
                  <li>Use a clear, well-lit photo facing forward</li>
                  <li>Full body or upper body photos work best</li>
                  <li>Wear form-fitting clothes in your photo</li>
                  <li>Plain background gives better results</li>
                  <li>Generation takes 15–30 seconds</li>
                </ul>
              </div>
            }
          </div>

        </div>
      }
    </div>
  `
})
export class TryonComponent implements OnInit {
  private http    = inject(HttpClient);
  private route   = inject(ActivatedRoute);
  private prodSvc = inject(ProductService);
  private api     = environment.apiUrl;

  products        = signal<Product[]>([]);
  selectedProduct = signal<Product | null>(null);
  userPhotoFile   = signal<File | null>(null);
  userPhotoUrl    = signal<string>('');
  isDragging      = signal(false);
  loading         = signal(false);
  error           = signal('');
  resultUrl       = signal('');
  resultProductName = signal('');
  analysis        = signal<any>(null);

  ngOnInit() {
    // Load all clothing products
    this.prodSvc.getProducts().subscribe(p => this.products.set(p));

    // Pre-select product if product_id in query params
    this.route.queryParams.subscribe(params => {
      if (params['product_id']) {
        this.prodSvc.getProduct(params['product_id']).subscribe(p => {
          if (p) this.selectedProduct.set(p);
        });
      }
    });
  }

  onPhotoSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0];
    if (file) this._setPhoto(file);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging.set(false);
    const file = event.dataTransfer?.files?.[0];
    if (file) this._setPhoto(file);
  }

  private _setPhoto(file: File) {
    if (file.size > 5 * 1024 * 1024) {
      this.error.set('Photo too large. Maximum size is 5MB.');
      return;
    }
    if (!file.type.startsWith('image/')) {
      this.error.set('Please select a valid image file.');
      return;
    }
    this.userPhotoFile.set(file);
    this.error.set('');
    const reader = new FileReader();
    reader.onload = (e) => this.userPhotoUrl.set(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  clearPhoto() {
    this.userPhotoFile.set(null);
    this.userPhotoUrl.set('');
  }

  generateTryOn() {
    const file    = this.userPhotoFile();
    const product = this.selectedProduct();
    if (!file || !product) return;

    this.loading.set(true);
    this.error.set('');
    this.resultUrl.set('');
    this.analysis.set(null);

    const formData = new FormData();
    formData.append('user_photo',  file);
    formData.append('product_id',  product.id);

    this.http.post<any>(`${this.api}/try-on/`, formData).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.resultUrl.set('http://localhost:8001' + res.result_url);
        this.resultProductName.set(res.product_name);
        this.analysis.set(res.analysis || null);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.detail || 'Generation failed. Please try again.');
      }
    });
  }
}
