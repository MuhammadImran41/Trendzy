import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'app-seller-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="font-display text-3xl font-bold text-white">Products</h1>
          <p class="text-gray-400 font-body text-sm mt-1">{{ products().length }} products in your store</p>
        </div>
        <button (click)="openAddModal()"
          class="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 rounded-xl font-body font-semibold text-white text-sm transition-all hover:shadow-lg hover:shadow-brand-500/30">
          + Add Product
        </button>
      </div>

      <!-- Search -->
      <div class="mb-5">
        <input type="text" [(ngModel)]="searchQuery" placeholder="Search products..."
          class="w-full max-w-sm bg-dark-700 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-body text-white placeholder-gray-500 focus:outline-none focus:border-brand-500/50" />
      </div>

      <div class="glass rounded-2xl overflow-hidden">
        <table class="w-full">
          <thead class="border-b border-white/5">
            <tr class="text-left">
              <th class="px-6 py-4 text-xs font-body font-semibold text-gray-500 uppercase tracking-widest">Product</th>
              <th class="px-6 py-4 text-xs font-body font-semibold text-gray-500 uppercase tracking-widest hidden md:table-cell">Category</th>
              <th class="px-6 py-4 text-xs font-body font-semibold text-gray-500 uppercase tracking-widest hidden lg:table-cell">Orig. Price</th>
              <th class="px-6 py-4 text-xs font-body font-semibold text-gray-500 uppercase tracking-widest">Sell Price</th>
              <th class="px-6 py-4 text-xs font-body font-semibold text-gray-500 uppercase tracking-widest hidden md:table-cell">Stock</th>
              <th class="px-6 py-4 text-xs font-body font-semibold text-gray-500 uppercase tracking-widest">Status</th>
              <th class="px-6 py-4 text-xs font-body font-semibold text-gray-500 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5">
            @for (product of filteredProducts(); track product.id) {
              <tr class="hover:bg-white/[0.02] transition-colors">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <img [src]="product.images[0]" class="w-10 h-10 rounded-lg object-cover flex-shrink-0" [alt]="product.name" />
                    <div>
                      <span class="font-body font-medium text-white text-sm block">{{ product.name }}</span>
                      <span class="font-body text-xs text-gray-500">{{ product.category }}</span>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 text-sm font-body text-gray-400 hidden md:table-cell">{{ product.category }}</td>
                <td class="px-6 py-4 text-sm font-body text-gray-500 hidden lg:table-cell">PKR {{ product.originalPrice | number }}</td>
                <td class="px-6 py-4 text-sm font-body text-brand-400 font-semibold">PKR {{ product.sellerPrice | number }}</td>
                <td class="px-6 py-4 text-sm font-body hidden md:table-cell"
                  [class.text-green-400]="product.stock > 10"
                  [class.text-yellow-400]="product.stock <= 10 && product.stock > 0"
                  [class.text-red-400]="product.stock === 0">
                  {{ product.stock }}
                </td>
                <td class="px-6 py-4">
                  <span class="px-2 py-1 rounded-full text-xs font-body font-medium"
                    [class.bg-green-500]="product.isActive" [class.text-green-900]="product.isActive"
                    [class.bg-gray-600]="!product.isActive" [class.text-gray-300]="!product.isActive">
                    {{ product.isActive ? 'Active' : 'Hidden' }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2">
                    <button (click)="openEditModal(product)"
                      class="px-2.5 py-1.5 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-body hover:bg-blue-600/40 transition-colors">
                      Edit
                    </button>
                    <button (click)="deleteProduct(product)"
                      class="px-2.5 py-1.5 bg-red-600/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-body hover:bg-red-600/40 transition-colors">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
        @if (filteredProducts().length === 0) {
          <div class="text-center py-12 text-gray-500 font-body">No products found.</div>
        }
      </div>
    </div>

    <!-- Add/Edit Modal -->
    @if (showModal()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" (click)="closeModal()">
        <div class="w-full max-w-lg glass rounded-3xl p-6" (click)="$event.stopPropagation()">
          <h2 class="font-display text-xl font-bold text-white mb-5">{{ editingProduct() ? 'Edit Product' : 'Add Product' }}</h2>

          <div class="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            <div>
              <label class="block text-xs font-body text-gray-400 mb-1">Product Name *</label>
              <input [(ngModel)]="form.name" type="text" placeholder="e.g. HydraFusion Night Cream"
                class="w-full bg-dark-700 border border-white/10 focus:border-brand-500/60 rounded-xl px-4 py-2.5 text-white font-body text-sm placeholder-gray-600 outline-none transition-colors" />
            </div>
            <div>
              <label class="block text-xs font-body text-gray-400 mb-1">Description *</label>
              <textarea [(ngModel)]="form.description" rows="2" placeholder="Product description..."
                class="w-full bg-dark-700 border border-white/10 focus:border-brand-500/60 rounded-xl px-4 py-2.5 text-white font-body text-sm placeholder-gray-600 outline-none transition-colors resize-none"></textarea>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-body text-gray-400 mb-1">Original Price (PKR) *</label>
                <input [(ngModel)]="form.originalPrice" type="number" placeholder="2800"
                  class="w-full bg-dark-700 border border-white/10 focus:border-brand-500/60 rounded-xl px-4 py-2.5 text-white font-body text-sm placeholder-gray-600 outline-none transition-colors" />
              </div>
              <div>
                <label class="block text-xs font-body text-gray-400 mb-1">Sell Price (PKR) *</label>
                <input [(ngModel)]="form.sellerPrice" type="number" placeholder="2200"
                  class="w-full bg-dark-700 border border-white/10 focus:border-brand-500/60 rounded-xl px-4 py-2.5 text-white font-body text-sm placeholder-gray-600 outline-none transition-colors" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-body text-gray-400 mb-1">Category *</label>
                <select [(ngModel)]="form.category"
                  class="w-full bg-dark-700 border border-white/10 focus:border-brand-500/60 rounded-xl px-4 py-2.5 text-white font-body text-sm outline-none transition-colors">
                  <option value="">Select...</option>
                  <option>Skincare</option>
                  <option>Makeup</option>
                  <option>Fragrance</option>
                  <option>Haircare</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-body text-gray-400 mb-1">Stock</label>
                <input [(ngModel)]="form.stock" type="number" placeholder="20"
                  class="w-full bg-dark-700 border border-white/10 focus:border-brand-500/60 rounded-xl px-4 py-2.5 text-white font-body text-sm placeholder-gray-600 outline-none transition-colors" />
              </div>
            </div>
            <div>
              <label class="block text-xs font-body text-gray-400 mb-1">Image URL</label>
              <input [(ngModel)]="form.imageUrl" type="url" placeholder="https://..."
                class="w-full bg-dark-700 border border-white/10 focus:border-brand-500/60 rounded-xl px-4 py-2.5 text-white font-body text-sm placeholder-gray-600 outline-none transition-colors" />
            </div>
          </div>

          @if (formError()) {
            <p class="text-red-400 text-xs font-body mt-3">{{ formError() }}</p>
          }

          <div class="flex gap-3 mt-5">
            <button (click)="closeModal()" class="flex-1 py-2.5 glass rounded-xl font-body text-sm text-gray-400 hover:text-white transition-colors">
              Cancel
            </button>
            <button (click)="saveProduct()" class="flex-1 py-2.5 bg-brand-600 hover:bg-brand-500 rounded-xl font-body font-semibold text-white text-sm transition-all">
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
  products = signal<Product[]>([]);
  searchQuery = '';
  showModal = signal(false);
  editingProduct = signal<Product | null>(null);
  formError = signal('');

  form = {
    name: '', description: '', originalPrice: 0, sellerPrice: 0,
    category: '', stock: 20, imageUrl: ''
  };

  filteredProducts() {
    if (!this.searchQuery) return this.products();
    const q = this.searchQuery.toLowerCase();
    return this.products().filter(p =>
      p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    );
  }

  ngOnInit() {
    this.productService.getProducts().subscribe(p => this.products.set(p));
  }

  openAddModal() {
    this.editingProduct.set(null);
    this.form = { name: '', description: '', originalPrice: 0, sellerPrice: 0, category: '', stock: 20, imageUrl: '' };
    this.formError.set('');
    this.showModal.set(true);
  }

  openEditModal(product: Product) {
    this.editingProduct.set(product);
    this.form = {
      name: product.name,
      description: product.description,
      originalPrice: product.originalPrice,
      sellerPrice: product.sellerPrice,
      category: product.category,
      stock: product.stock,
      imageUrl: product.images[0] || ''
    };
    this.formError.set('');
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingProduct.set(null);
  }

  saveProduct() {
    if (!this.form.name || !this.form.description || !this.form.category || !this.form.sellerPrice) {
      this.formError.set('Please fill all required fields.');
      return;
    }

    const productData = {
      name: this.form.name,
      description: this.form.description,
      originalPrice: Number(this.form.originalPrice),
      sellerPrice: Number(this.form.sellerPrice),
      category: this.form.category,
      stock: Number(this.form.stock),
      images: this.form.imageUrl ? [this.form.imageUrl] : [],
      tags: [],
      isActive: true
    };

    const editing = this.editingProduct();
    if (editing) {
      this.productService.updateProduct(editing.id, productData).subscribe({
        next: (updated) => {
          this.products.update(list => list.map(p => p.id === updated.id ? updated : p));
          this.closeModal();
        },
        error: () => {
          // Optimistic update for offline/mock mode
          this.products.update(list => list.map(p =>
            p.id === editing.id ? { ...p, ...productData } : p
          ));
          this.closeModal();
        }
      });
    } else {
      this.productService.addProduct(productData).subscribe({
        next: (created) => {
          this.products.update(list => [...list, created]);
          this.closeModal();
        },
        error: () => {
          const newProduct: Product = {
            id: Date.now().toString(),
            ...productData,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          this.products.update(list => [...list, newProduct]);
          this.closeModal();
        }
      });
    }
  }

  deleteProduct(product: Product) {
    if (!confirm(`Delete "${product.name}"?`)) return;
    this.productService.deleteProduct(product.id).subscribe({
      next: () => this.products.update(list => list.filter(p => p.id !== product.id)),
      error: () => this.products.update(list => list.filter(p => p.id !== product.id))
    });
  }
}
