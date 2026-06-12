import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'app-seller-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
    .page-eyebrow { font-family:'Jost',sans-serif; font-size:0.65rem; font-weight:600; letter-spacing:0.25em; text-transform:uppercase; color:#c9a96e; margin-bottom:0.5rem; }
    .page-title   { font-family:'Cormorant Garamond',Georgia,serif; font-size:2.25rem; font-weight:400; color:#1a1410; margin-bottom:0.25rem; }
    .page-sub     { font-family:'Jost',sans-serif; font-size:0.82rem; color:#9e9890; margin-bottom:2rem; }
    .gold-line    { height:1px; background:linear-gradient(90deg,#c9a96e,transparent); width:40px; margin-bottom:2rem; }

    .toolbar { display:flex; align-items:center; justify-content:space-between; gap:1rem; flex-wrap:wrap; margin-bottom:1.5rem; }

    .search-input {
      padding:0.5rem 0.875rem;
      background:#fff; border:1px solid #ddd8d0;
      font-family:'Jost',sans-serif; font-size:0.82rem; color:#1a1410;
      outline:none; width:260px; transition:border-color 0.2s;
    }
    .search-input::placeholder { color:#b0a898; }
    .search-input:focus { border-color:#c9a96e; }

    .add-btn {
      display:flex; align-items:center; gap:0.5rem;
      padding:0.5rem 1.25rem;
      background:#1a1410; color:#faf7f4;
      font-family:'Jost',sans-serif; font-size:0.75rem; font-weight:500;
      letter-spacing:0.1em; text-transform:uppercase;
      border:none; cursor:pointer; transition:background 0.2s;
    }
    .add-btn:hover { background:#2d2520; }

    /* ── Table ── */
    .table-wrap { border:1px solid #e8e0d6; background:#fff; overflow:hidden; }
    .table-head {
      display:grid; grid-template-columns:2.5fr 1fr 1fr 1fr 0.8fr 0.8fr 1fr;
      padding:0.625rem 1.25rem;
      background:#f5f0e8; border-bottom:1px solid #e8e0d6;
    }
    .table-head span {
      font-family:'Jost',sans-serif; font-size:0.6rem; font-weight:600;
      letter-spacing:0.18em; text-transform:uppercase; color:#9e9890;
    }
    .table-row {
      display:grid; grid-template-columns:2.5fr 1fr 1fr 1fr 0.8fr 0.8fr 1fr;
      padding:0.875rem 1.25rem; border-bottom:1px solid #f0ebe4;
      align-items:center; transition:background 0.15s;
    }
    .table-row:last-child { border-bottom:none; }
    .table-row:hover { background:#faf7f4; }

    .prod-cell { display:flex; align-items:center; gap:0.75rem; }
    .prod-img  { width:40px; height:40px; object-fit:cover; background:#f5f0e8; flex-shrink:0; }
    .prod-name { font-family:'Jost',sans-serif; font-size:0.82rem; font-weight:500; color:#1a1410; }
    .prod-cat  { font-family:'Jost',sans-serif; font-size:0.7rem; color:#9e9890; margin-top:1px; }

    .cell-text  { font-family:'Jost',sans-serif; font-size:0.8rem; color:#6b6560; }
    .cell-price { font-family:'Cormorant Garamond',serif; font-size:1rem; font-weight:600; color:#1a1410; }
    .cell-orig  { font-family:'Jost',sans-serif; font-size:0.78rem; color:#b0a898; text-decoration:line-through; }

    .stock-ok   { font-family:'Jost',sans-serif; font-size:0.78rem; color:#16a34a; }
    .stock-low  { font-family:'Jost',sans-serif; font-size:0.78rem; color:#d97706; }
    .stock-out  { font-family:'Jost',sans-serif; font-size:0.78rem; color:#dc2626; }

    .status-active { display:inline-flex; padding:0.2rem 0.625rem; font-family:'Jost',sans-serif; font-size:0.62rem; font-weight:600; letter-spacing:0.06em; text-transform:uppercase; background:rgba(22,163,74,0.08); border:1px solid rgba(22,163,74,0.25); color:#16a34a; }
    .status-hidden { display:inline-flex; padding:0.2rem 0.625rem; font-family:'Jost',sans-serif; font-size:0.62rem; font-weight:600; letter-spacing:0.06em; text-transform:uppercase; background:rgba(107,101,96,0.08); border:1px solid rgba(107,101,96,0.2); color:#9e9890; }

    .btn-edit   { padding:0.3rem 0.75rem; background:rgba(37,99,235,0.06); border:1px solid rgba(37,99,235,0.2); font-family:'Jost',sans-serif; font-size:0.7rem; color:#2563eb; cursor:pointer; transition:all 0.2s; }
    .btn-edit:hover   { background:rgba(37,99,235,0.12); }
    .btn-delete { padding:0.3rem 0.75rem; background:rgba(220,38,38,0.06); border:1px solid rgba(220,38,38,0.2); font-family:'Jost',sans-serif; font-size:0.7rem; color:#dc2626; cursor:pointer; transition:all 0.2s; margin-left:0.375rem; }
    .btn-delete:hover { background:rgba(220,38,38,0.12); }

    .empty-state { padding:4rem; text-align:center; font-family:'Cormorant Garamond',serif; font-size:1.25rem; color:#9e9890; }

    /* ── Modal ── */
    .modal-backdrop {
      position:fixed; inset:0; z-index:100;
      background:rgba(26,20,16,0.5);
      backdrop-filter:blur(4px);
      display:flex; align-items:center; justify-content:center; padding:1rem;
    }
    .modal-box {
      background:#faf7f4; border:1px solid #e8e0d6;
      width:100%; max-width:520px;
      max-height:90vh; overflow-y:auto;
    }
    .modal-header {
      display:flex; align-items:center; justify-content:space-between;
      padding:1.25rem 1.5rem; border-bottom:1px solid #e8e0d6;
    }
    .modal-title { font-family:'Cormorant Garamond',serif; font-size:1.4rem; font-weight:400; color:#1a1410; }
    .modal-close { background:none; border:none; cursor:pointer; color:#9e9890; padding:0.25rem; transition:color 0.2s; }
    .modal-close:hover { color:#1a1410; }
    .modal-body { padding:1.5rem; display:flex; flex-direction:column; gap:1rem; }
    .modal-footer { padding:1rem 1.5rem; border-top:1px solid #e8e0d6; display:flex; gap:0.75rem; }

    .field-label { display:block; font-family:'Jost',sans-serif; font-size:0.62rem; font-weight:600; letter-spacing:0.15em; text-transform:uppercase; color:#9e9890; margin-bottom:0.375rem; }
    .field-input {
      width:100%; background:#fff; border:1px solid #ddd8d0;
      padding:0.625rem 0.875rem;
      font-family:'Jost',sans-serif; font-size:0.875rem; color:#1a1410;
      outline:none; transition:border-color 0.2s;
    }
    .field-input::placeholder { color:#b0a898; }
    .field-input:focus { border-color:#c9a96e; }
    .field-grid { display:grid; grid-template-columns:1fr 1fr; gap:0.875rem; }

    .form-error { font-family:'Jost',sans-serif; font-size:0.78rem; color:#dc2626; padding:0.5rem 0.875rem; background:rgba(220,38,38,0.06); border:1px solid rgba(220,38,38,0.2); }

    .btn-cancel-modal { flex:1; padding:0.625rem; background:#fff; border:1px solid #ddd8d0; font-family:'Jost',sans-serif; font-size:0.78rem; color:#6b6560; cursor:pointer; transition:all 0.2s; }
    .btn-cancel-modal:hover { border-color:#1a1410; color:#1a1410; }
    .btn-save { flex:1; padding:0.625rem; background:#1a1410; border:none; font-family:'Jost',sans-serif; font-size:0.78rem; font-weight:500; letter-spacing:0.1em; text-transform:uppercase; color:#faf7f4; cursor:pointer; transition:background 0.2s; }
    .btn-save:hover { background:#2d2520; }
  `],
  template: `
    <div>
      <div class="page-eyebrow">Catalogue</div>
      <h1 class="page-title">Products</h1>
      <p class="page-sub">{{ products().length }} products in your store</p>
      <div class="gold-line"></div>

      <div class="toolbar">
        <input class="search-input" type="text" [(ngModel)]="searchQuery" placeholder="Search products..." />
        <button class="add-btn" (click)="openAddModal()">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Product
        </button>
      </div>

      <div class="table-wrap">
        <div class="table-head">
          <span>Product</span>
          <span>Category</span>
          <span>Orig. Price</span>
          <span>Sell Price</span>
          <span>Stock</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        @if (filteredProducts().length === 0) {
          <div class="empty-state">No products found.</div>
        }

        @for (p of filteredProducts(); track p.id) {
          <div class="table-row">
            <div class="prod-cell">
              <img [src]="p.images[0]" class="prod-img" [alt]="p.name" />
              <div>
                <div class="prod-name">{{ p.name }}</div>
                <div class="prod-cat">{{ p.category }}</div>
              </div>
            </div>
            <span class="cell-text">{{ p.category }}</span>
            <span class="cell-orig">{{ p.originalPrice | number }}</span>
            <span class="cell-price">PKR {{ p.sellerPrice | number }}</span>
            <span [class.stock-ok]="p.stock > 10" [class.stock-low]="p.stock <= 10 && p.stock > 0" [class.stock-out]="p.stock === 0">
              {{ p.stock }}
            </span>
            <span [class.status-active]="p.isActive" [class.status-hidden]="!p.isActive">
              {{ p.isActive ? 'Active' : 'Hidden' }}
            </span>
            <div>
              <button class="btn-edit" (click)="openEditModal(p)">Edit</button>
              <button class="btn-delete" (click)="deleteProduct(p)">Delete</button>
            </div>
          </div>
        }
      </div>
    </div>

    <!-- Modal -->
    @if (showModal()) {
      <div class="modal-backdrop" (click)="closeModal()">
        <div class="modal-box" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <span class="modal-title">{{ editingProduct() ? 'Edit Product' : 'Add Product' }}</span>
            <button class="modal-close" (click)="closeModal()">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div class="modal-body">
            <div>
              <label class="field-label">Product Name *</label>
              <input class="field-input" [(ngModel)]="form.name" type="text" placeholder="e.g. HydraFusion Night Cream" />
            </div>
            <div>
              <label class="field-label">Description *</label>
              <textarea class="field-input" [(ngModel)]="form.description" rows="2" placeholder="Product description..." style="resize:none;"></textarea>
            </div>
            <div class="field-grid">
              <div>
                <label class="field-label">Original Price (PKR) *</label>
                <input class="field-input" [(ngModel)]="form.originalPrice" type="number" placeholder="2800" />
              </div>
              <div>
                <label class="field-label">Sell Price (PKR) *</label>
                <input class="field-input" [(ngModel)]="form.sellerPrice" type="number" placeholder="2200" />
              </div>
            </div>
            <div class="field-grid">
              <div>
                <label class="field-label">Category *</label>
                <select class="field-input" [(ngModel)]="form.category">
                  <option value="">Select...</option>
                  <option>Skincare</option>
                  <option>Makeup</option>
                  <option>Fragrance</option>
                  <option>Haircare</option>
                  <option>Body</option>
                  <option>Clothing</option>
                  <option>Jewellery</option>
                  <option>Accessories</option>
                  <option>Bags</option>
                  <option>Shoes</option>
                  <option>Kids</option>
                  <option>Home & Living</option>
                  <option>Health & Wellness</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label class="field-label">Stock</label>
                <input class="field-input" [(ngModel)]="form.stock" type="number" placeholder="20" />
              </div>
            </div>
            <div>
              <label class="field-label">Product Image</label>
              <div style="display:flex;flex-direction:column;gap:0.5rem;">
                <!-- File upload -->
                <label style="display:flex;align-items:center;gap:0.75rem;padding:0.625rem 0.875rem;border:1px dashed #ddd8d0;background:#faf7f4;cursor:pointer;transition:border-color 0.2s;"
                       [style.border-color]="form.imageUrl ? '#c9a96e' : '#ddd8d0'">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9e9890" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  <span style="font-family:'Jost',sans-serif;font-size:0.78rem;color:#9e9890;">
                    {{ imageFileName || 'Click to upload image from PC' }}
                  </span>
                  <input type="file" accept="image/*" style="display:none;" (change)="onImageFileSelected($event)" />
                </label>
                <!-- OR URL input -->
                <div style="display:flex;align-items:center;gap:0.5rem;">
                  <div style="flex:1;height:1px;background:#e8e0d6;"></div>
                  <span style="font-family:'Jost',sans-serif;font-size:0.65rem;color:#b0a898;letter-spacing:0.1em;">OR PASTE URL</span>
                  <div style="flex:1;height:1px;background:#e8e0d6;"></div>
                </div>
                <input class="field-input" [(ngModel)]="form.imageUrl" type="url" placeholder="https://..." (ngModelChange)="onUrlChange()" />
                <!-- Preview -->
                @if (form.imageUrl) {
                  <div style="display:flex;align-items:center;gap:0.75rem;padding:0.5rem;background:#f5f0e8;border:1px solid #e8e0d6;">
                    <img [src]="form.imageUrl" style="width:48px;height:48px;object-fit:cover;background:#e8e0d6;" alt="preview" />
                    <span style="font-family:'Jost',sans-serif;font-size:0.72rem;color:#9e9890;flex:1;">Preview</span>
                    <button type="button" (click)="clearImage()" style="background:none;border:none;cursor:pointer;color:#dc2626;font-size:0.72rem;font-family:'Jost',sans-serif;">✕ Remove</button>
                  </div>
                }
              </div>
            </div>
            @if (formError()) {
              <div class="form-error">{{ formError() }}</div>
            }
          </div>

          <div class="modal-footer">
            <button class="btn-cancel-modal" (click)="closeModal()">Cancel</button>
            <button class="btn-save" (click)="saveProduct()">
              {{ editingProduct() ? 'Save Changes' : 'Add Product' }}
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class SellerProductsComponent implements OnInit {
  private productService = inject(ProductService);
  private http           = inject(HttpClient);
  products      = signal<Product[]>([]);
  searchQuery   = '';
  showModal     = signal(false);
  editingProduct = signal<Product | null>(null);
  formError     = signal('');
  imageFileName = '';
  form = { name:'', description:'', originalPrice:0, sellerPrice:0, category:'', stock:20, imageUrl:'' };

  onImageFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      this.formError.set('Image too large — max 10MB.'); return;
    }
    this.imageFileName = 'Uploading...';
    this.formError.set('');

    // Upload to ImgBB — stores full resolution, returns permanent URL
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = (e.target?.result as string).split(',')[1];
      const formData = new FormData();
      formData.append('key', 'd3397ed5f3197cb032cfcd2e5bbda70b');
      formData.append('image', base64);

      this.http.post<any>('https://api.imgbb.com/1/upload', formData).subscribe({
        next: (res) => {
          this.form.imageUrl = res.data.url;
          this.imageFileName = file.name;
        },
        error: () => {
          // Fallback: compress locally if ImgBB fails
          this._compressToBase64(file);
        }
      });
    };
    reader.readAsDataURL(file);
  }

  private _compressToBase64(file: File) {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxW = 300;
      const scale = img.width > maxW ? maxW / img.width : 1;
      canvas.width  = Math.round(img.width  * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      this.form.imageUrl = canvas.toDataURL('image/jpeg', 0.75);
      this.imageFileName = file.name;
      URL.revokeObjectURL(objectUrl);
    };
    img.src = objectUrl;
  }

  onUrlChange() {
    // If user types a URL, clear the file name
    this.imageFileName = '';
  }

  clearImage() {
    this.form.imageUrl  = '';
    this.imageFileName  = '';
  }

  filteredProducts() {
    if (!this.searchQuery) return this.products();
    const q = this.searchQuery.toLowerCase();
    return this.products().filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  }

  ngOnInit() { this.productService.getProducts().subscribe(p => this.products.set(p)); }

  openAddModal() {
    this.editingProduct.set(null);
    this.form = { name:'', description:'', originalPrice:0, sellerPrice:0, category:'', stock:20, imageUrl:'' };
    this.imageFileName = '';
    this.formError.set(''); this.showModal.set(true);
  }
  openEditModal(p: Product) {
    this.editingProduct.set(p);
    this.form = { name:p.name, description:p.description, originalPrice:p.originalPrice, sellerPrice:p.sellerPrice, category:p.category, stock:p.stock, imageUrl:p.images[0]||'' };
    this.imageFileName = '';
    this.formError.set(''); this.showModal.set(true);
  }
  closeModal() { this.showModal.set(false); this.editingProduct.set(null); this.imageFileName = ''; }

  saveProduct() {
    if (!this.form.name || !this.form.description || !this.form.category || !this.form.sellerPrice) {
      this.formError.set('Please fill all required fields.'); return;
    }
    const data = { name:this.form.name, description:this.form.description, originalPrice:Number(this.form.originalPrice), sellerPrice:Number(this.form.sellerPrice), category:this.form.category, stock:Number(this.form.stock), images:this.form.imageUrl?[this.form.imageUrl]:[], tags:[], isActive:true };
    const editing = this.editingProduct();
    if (editing) {
      this.productService.updateProduct(editing.id, data).subscribe({
        next: (u) => { this.products.update(l => l.map(p => p.id === u.id ? u : p)); this.closeModal(); },
        error: (err) => {
          const msg = err?.error?.detail || err?.message || 'Update failed.';
          this.formError.set(msg);
        }
      });
    } else {
      this.productService.addProduct(data).subscribe({
        next: (c) => { this.products.update(l => [...l, c]); this.closeModal(); },
        error: (err) => {
          const msg = err?.error?.detail || err?.message || 'Failed to add product. Check your connection.';
          this.formError.set(msg);
        }
      });
    }
  }

  deleteProduct(p: Product) {
    if (!confirm(`Delete "${p.name}"?`)) return;
    this.productService.deleteProduct(p.id).subscribe({
      next: () => this.products.update(l => l.filter(x => x.id !== p.id)),
      error: () => this.products.update(l => l.filter(x => x.id !== p.id))
    });
  }
}
