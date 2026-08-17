import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Product } from '../models/product.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // Fallback mock products (used only when API is unreachable)
  private mockProducts: Product[] = [
    {
      id: '1', name: 'HydraFusion Night Cream',
      description: 'Deep moisturizing night cream with hyaluronic acid and vitamin E for radiant skin.',
      originalPrice: 2800, sellerPrice: 2200,
      images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400'],
      category: 'Skincare', tags: ['moisturizer', 'night cream'], stock: 25, isActive: true,
      createdAt: new Date(), updatedAt: new Date()
    },
    {
      id: '2', name: 'Velvet Rose Lipstick',
      description: 'Long-lasting matte lipstick in rich rose tones. 12-hour wear formula.',
      originalPrice: 1200, sellerPrice: 950,
      images: ['https://images.unsplash.com/photo-1586495777744-4e6232bf9f06?w=400'],
      category: 'Makeup', tags: ['lipstick', 'matte'], stock: 50, isActive: true,
      createdAt: new Date(), updatedAt: new Date()
    },
    {
      id: '3', name: 'Glow Serum Pro',
      description: 'Vitamin C brightening serum that reduces dark spots and evens skin tone.',
      originalPrice: 3500, sellerPrice: 2800,
      images: ['https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400'],
      category: 'Skincare', tags: ['serum', 'vitamin c'], stock: 18, isActive: true,
      createdAt: new Date(), updatedAt: new Date()
    },
    {
      id: '4', name: 'Aqua Fresh Toner',
      description: 'Balancing facial toner with rose water and niacinamide for clear pores.',
      originalPrice: 1800, sellerPrice: 1400,
      images: ['https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400'],
      category: 'Skincare', tags: ['toner', 'pore care'], stock: 35, isActive: true,
      createdAt: new Date(), updatedAt: new Date()
    },
    {
      id: '5', name: 'Lash Extend Mascara',
      description: 'Volumizing and lengthening mascara for dramatic lashes.',
      originalPrice: 1600, sellerPrice: 1250,
      images: ['https://images.unsplash.com/photo-1512207736890-6ffed8a84e8d?w=400'],
      category: 'Makeup', tags: ['mascara', 'volumizing'], stock: 42, isActive: true,
      createdAt: new Date(), updatedAt: new Date()
    },
    {
      id: '6', name: 'Silk Perfume Mist',
      description: 'Floral oriental fragrance with notes of jasmine, sandalwood and musk.',
      originalPrice: 4200, sellerPrice: 3400,
      images: ['https://images.unsplash.com/photo-1541643600914-78b084683702?w=400'],
      category: 'Fragrance', tags: ['perfume', 'floral'], stock: 15, isActive: true,
      createdAt: new Date(), updatedAt: new Date()
    }
  ];

  // ── Buyer methods — load from production DB ──────────────────────────────

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products/`).pipe(
      catchError(() => of(this.mockProducts))
    );
  }

  getProductById(id: string): Observable<Product | undefined> {
    return this.http.get<Product>(`${this.apiUrl}/products/${id}`).pipe(
      catchError(() => of(this.mockProducts.find(p => p.id === id)))
    );
  }

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/products/categories/`).pipe(
      catchError(() => {
        const cats = [...new Set(this.mockProducts.map(p => p.category))];
        return of(cats);
      })
    );
  }

  // ── Seller methods ────────────────────────────────────────────────────────

  addProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/products/`, product);
  }

  updateProduct(id: string, product: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/products/${id}`, product);
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/products/${id}`);
  }
}
