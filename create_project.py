import os
import subprocess
import sys

project_files = {

# ============================================================
# ROOT CONFIG FILES
# ============================================================

"package.json": """{
  "name": "oriflame-reseller-frontend",
  "version": "0.0.0",
  "scripts": {
    "ng": "ng",
    "start": "ng serve",
    "build": "ng build",
    "watch": "ng build --watch --configuration development",
    "test": "ng test"
  },
  "private": true,
  "dependencies": {
    "@angular/animations": "^19.0.0",
    "@angular/common": "^19.0.0",
    "@angular/compiler": "^19.0.0",
    "@angular/core": "^19.0.0",
    "@angular/forms": "^19.0.0",
    "@angular/platform-browser": "^19.0.0",
    "@angular/platform-browser-dynamic": "^19.0.0",
    "@angular/router": "^19.0.0",
    "@angular/fire": "^18.0.1",
    "firebase": "^10.12.0",
    "rxjs": "~7.8.0",
    "tslib": "^2.3.0",
    "zone.js": "~0.15.0"
  },
  "devDependencies": {
    "@angular-devkit/build-angular": "^19.0.0",
    "@angular/cli": "^19.0.0",
    "@angular/compiler-cli": "^19.0.0",
    "@tailwindcss/postcss": "^4.0.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^4.0.0",
    "typescript": "~5.6.0"
  }
}
""",

"angular.json": """{
  "$schema": "./node_modules/@angular/cli/lib/config/schema.json",
  "version": 1,
  "newProjectRoot": "projects",
  "projects": {
    "oriflame-reseller": {
      "projectType": "application",
      "schematics": {},
      "root": "",
      "sourceRoot": "src",
      "prefix": "app",
      "architect": {
        "build": {
          "builder": "@angular-devkit/build-angular:application",
          "options": {
            "outputPath": "dist/oriflame-reseller",
            "index": "src/index.html",
            "browser": "src/main.ts",
            "polyfills": ["zone.js"],
            "tsConfig": "tsconfig.app.json",
            "assets": [
              { "glob": "**/*", "input": "public" }
            ],
            "styles": ["src/styles.css"],
            "scripts": []
          },
          "configurations": {
            "production": {
              "budgets": [
                { "type": "initial", "maximumWarning": "500kB", "maximumError": "1MB" },
                { "type": "anyComponentStyle", "maximumWarning": "4kB", "maximumError": "8kB" }
              ],
              "outputHashing": "all"
            },
            "development": {
              "optimization": false,
              "extractLicenses": false,
              "sourceMap": true
            }
          },
          "defaultConfiguration": "production"
        },
        "serve": {
          "builder": "@angular-devkit/build-angular:dev-server",
          "configurations": {
            "production": { "buildTarget": "oriflame-reseller:build:production" },
            "development": { "buildTarget": "oriflame-reseller:build:development" }
          },
          "defaultConfiguration": "development"
        }
      }
    }
  }
}
""",

"tsconfig.json": """{
  "compileOnSave": false,
  "compilerOptions": {
    "outDir": "./dist/out-tsc",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "experimentalDecorators": true,
    "moduleResolution": "bundler",
    "importHelpers": true,
    "target": "ES2022",
    "module": "ES2022",
    "lib": ["ES2022", "dom"]
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
""",

"tsconfig.app.json": """{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./out-tsc/app",
    "types": []
  },
  "files": ["src/main.ts"],
  "include": ["src/**/*.d.ts"]
}
""",

"postcss.config.js": """module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
""",

"tailwind.config.js": """/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fff0f6',
          100: '#ffd6e8',
          200: '#ffadd0',
          300: '#ff85b8',
          400: '#ff5c9f',
          500: '#e8347a',
          600: '#c4175e',
          700: '#9e0d49',
          800: '#780637',
          900: '#520226',
        },
        dark: {
          900: '#0d0d0d',
          800: '#161616',
          700: '#1f1f1f',
          600: '#2a2a2a',
        }
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease forwards',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
};
""",

# ============================================================
# MAIN ENTRY
# ============================================================

"src/main.ts": """import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
""",

"src/index.html": """<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>GlowMart — Premium Beauty & Skincare</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/x-icon" href="favicon.ico">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
</head>
<body class="bg-dark-900 text-white">
  <app-root></app-root>
</body>
</html>
""",

"src/styles.css": """@import 'tailwindcss';

:root {
  --brand-primary: #e8347a;
  --brand-light: #ff85b8;
  --dark-bg: #0d0d0d;
  --dark-card: #161616;
  --dark-border: rgba(255,255,255,0.08);
}

* { box-sizing: border-box; margin: 0; padding: 0; }

html { scroll-behavior: smooth; }

body {
  background: var(--dark-bg);
  color: #fff;
  font-family: 'DM Sans', sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* Scrollbar */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: #0d0d0d; }
::-webkit-scrollbar-thumb { background: #e8347a; border-radius: 3px; }

/* Global card hover */
.card-hover {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.card-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 60px rgba(232, 52, 122, 0.2);
}

/* Gradient text */
.gradient-text {
  background: linear-gradient(135deg, #e8347a, #ff85b8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Glass card */
.glass {
  background: rgba(255,255,255,0.04);
  backdrop-filter: blur(12px);
  border: 1px solid var(--dark-border);
}

/* Shimmer skeleton */
.skeleton {
  background: linear-gradient(90deg, #1f1f1f 25%, #2a2a2a 50%, #1f1f1f 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
""",

# ============================================================
# APP CONFIG & ROOT COMPONENT
# ============================================================

"src/app/app.config.ts": """import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideAnimationsAsync(),
  ]
};
""",

"src/app/app.routes.ts": """import { Routes } from '@angular/router';
import { sellerAuthGuard } from './guards/seller-auth.guard';

export const routes: Routes = [
  // ── Buyer (public) routes ──────────────────────────────
  {
    path: '',
    loadComponent: () => import('./layouts/buyer-layout/buyer-layout.component')
      .then(m => m.BuyerLayoutComponent),
    children: [
      { path: '', loadComponent: () => import('./pages/buyer/home/home.component').then(m => m.HomeComponent) },
      { path: 'products', loadComponent: () => import('./pages/buyer/products/products.component').then(m => m.ProductsComponent) },
      { path: 'product/:id', loadComponent: () => import('./pages/buyer/product-detail/product-detail.component').then(m => m.ProductDetailComponent) },
      { path: 'cart', loadComponent: () => import('./pages/buyer/cart/cart.component').then(m => m.CartComponent) },
      { path: 'checkout', loadComponent: () => import('./pages/buyer/checkout/checkout.component').then(m => m.CheckoutComponent) },
      { path: 'order-success', loadComponent: () => import('./pages/buyer/order-success/order-success.component').then(m => m.OrderSuccessComponent) },
    ]
  },

  // ── Seller auth ────────────────────────────────────────
  {
    path: 'seller/login',
    loadComponent: () => import('./pages/seller/seller-login/seller-login.component').then(m => m.SellerLoginComponent)
  },

  // ── Seller panel (protected) ───────────────────────────
  {
    path: 'seller',
    canActivate: [sellerAuthGuard],
    loadComponent: () => import('./layouts/seller-layout/seller-layout.component').then(m => m.SellerLayoutComponent),
    children: [
      { path: 'dashboard', loadComponent: () => import('./pages/seller/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'products', loadComponent: () => import('./pages/seller/products/products.component').then(m => m.SellerProductsComponent) },
      { path: 'orders', loadComponent: () => import('./pages/seller/orders/orders.component').then(m => m.SellerOrdersComponent) },
      { path: 'scraper', loadComponent: () => import('./pages/seller/scraper/scraper.component').then(m => m.ScraperComponent) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  { path: '**', redirectTo: '' }
];
""",

"src/app/app.component.ts": """import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet />'
})
export class AppComponent {}
""",

# ============================================================
# MODELS
# ============================================================

"src/app/models/product.model.ts": """export interface Product {
  id: string;
  name: string;
  description: string;
  originalPrice: number;
  sellerPrice: number;
  images: string[];
  category: string;
  tags: string[];
  stock: number;
  rating: number;
  reviews: number;
  isActive: boolean;
  oriflameUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}
""",

"src/app/models/order.model.ts": """export interface Order {
  id: string;
  buyerName: string;
  buyerPhone: string;
  buyerAddress: string;
  buyerCity: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: 'cod';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
}
""",

"src/app/models/cart-item.model.ts": """import { Product } from './product.model';

export interface CartItem {
  product: Product;
  quantity: number;
}
""",

# ============================================================
# SERVICES
# ============================================================

"src/app/services/firebase.config.ts": """export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
""",

"src/app/services/product.service.ts": """import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api';

  // Mock products for development
  private mockProducts: Product[] = [
    {
      id: '1',
      name: 'HydraFusion Night Cream',
      description: 'Deep moisturizing night cream with hyaluronic acid and vitamin E for radiant skin.',
      originalPrice: 2800,
      sellerPrice: 2200,
      images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400'],
      category: 'Skincare',
      tags: ['moisturizer', 'night cream', 'hydrating'],
      stock: 25,
      rating: 4.7,
      reviews: 128,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      name: 'Velvet Rose Lipstick',
      description: 'Long-lasting matte lipstick in rich rose tones. 12-hour wear formula.',
      originalPrice: 1200,
      sellerPrice: 950,
      images: ['https://images.unsplash.com/photo-1586495777744-4e6232bf9f06?w=400'],
      category: 'Makeup',
      tags: ['lipstick', 'matte', 'long-lasting'],
      stock: 50,
      rating: 4.5,
      reviews: 89,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '3',
      name: 'Glow Serum Pro',
      description: 'Vitamin C brightening serum that reduces dark spots and evens skin tone.',
      originalPrice: 3500,
      sellerPrice: 2800,
      images: ['https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400'],
      category: 'Skincare',
      tags: ['serum', 'vitamin c', 'brightening'],
      stock: 18,
      rating: 4.8,
      reviews: 212,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '4',
      name: 'Aqua Fresh Toner',
      description: 'Balancing facial toner with rose water and niacinamide for clear pores.',
      originalPrice: 1800,
      sellerPrice: 1400,
      images: ['https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400'],
      category: 'Skincare',
      tags: ['toner', 'pore care', 'rose water'],
      stock: 35,
      rating: 4.4,
      reviews: 67,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '5',
      name: 'Lash Extend Mascara',
      description: 'Volumizing and lengthening mascara for dramatic lashes. Smudge-proof formula.',
      originalPrice: 1600,
      sellerPrice: 1250,
      images: ['https://images.unsplash.com/photo-1512207736890-6ffed8a84e8d?w=400'],
      category: 'Makeup',
      tags: ['mascara', 'volumizing', 'lashes'],
      stock: 42,
      rating: 4.6,
      reviews: 155,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '6',
      name: 'Silk Perfume Mist',
      description: 'Floral oriental fragrance with notes of jasmine, sandalwood and musk.',
      originalPrice: 4200,
      sellerPrice: 3400,
      images: ['https://images.unsplash.com/photo-1541643600914-78b084683702?w=400'],
      category: 'Fragrance',
      tags: ['perfume', 'floral', 'oriental'],
      stock: 15,
      rating: 4.9,
      reviews: 301,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  getProducts(): Observable<Product[]> {
    return of(this.mockProducts);
  }

  getProductById(id: string): Observable<Product | undefined> {
    return of(this.mockProducts.find(p => p.id === id));
  }

  getCategories(): Observable<string[]> {
    const cats = [...new Set(this.mockProducts.map(p => p.category))];
    return of(cats);
  }

  // Seller methods — will call FastAPI backend
  addProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/products`, product);
  }

  updateProduct(id: string, product: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/products/${id}`, product);
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/products/${id}`);
  }
}
""",

"src/app/services/cart.service.ts": """import { Injectable, signal, computed } from '@angular/core';
import { CartItem } from '../models/cart-item.model';
import { Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  private _items = signal<CartItem[]>([]);

  items = this._items.asReadonly();

  totalItems = computed(() =>
    this._items().reduce((sum, item) => sum + item.quantity, 0)
  );

  totalPrice = computed(() =>
    this._items().reduce((sum, item) => sum + item.product.sellerPrice * item.quantity, 0)
  );

  addToCart(product: Product, quantity = 1): void {
    const existing = this._items().find(i => i.product.id === product.id);
    if (existing) {
      this._items.update(items =>
        items.map(i => i.product.id === product.id
          ? { ...i, quantity: i.quantity + quantity }
          : i
        )
      );
    } else {
      this._items.update(items => [...items, { product, quantity }]);
    }
  }

  removeFromCart(productId: string): void {
    this._items.update(items => items.filter(i => i.product.id !== productId));
  }

  updateQuantity(productId: string, quantity: number): void {
    if (quantity <= 0) { this.removeFromCart(productId); return; }
    this._items.update(items =>
      items.map(i => i.product.id === productId ? { ...i, quantity } : i)
    );
  }

  clearCart(): void {
    this._items.set([]);
  }
}
""",

"src/app/services/order.service.ts": """import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api';

  placeOrder(order: Omit<Order, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/orders`, order);
  }

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/orders`);
  }

  updateOrderStatus(id: string, status: Order['status']): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/orders/${id}`, { status });
  }
}
""",

"src/app/services/auth.service.ts": """import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _isLoggedIn = signal(false);
  isLoggedIn = this._isLoggedIn.asReadonly();

  // Hardcoded seller creds for now — will integrate Firebase Auth
  private SELLER_EMAIL = 'seller@glowmart.pk';
  private SELLER_PASSWORD = 'seller123';

  constructor(private router: Router) {
    const stored = localStorage.getItem('seller_session');
    if (stored === 'active') this._isLoggedIn.set(true);
  }

  login(email: string, password: string): boolean {
    if (email === this.SELLER_EMAIL && password === this.SELLER_PASSWORD) {
      this._isLoggedIn.set(true);
      localStorage.setItem('seller_session', 'active');
      return true;
    }
    return false;
  }

  logout(): void {
    this._isLoggedIn.set(false);
    localStorage.removeItem('seller_session');
    this.router.navigate(['/seller/login']);
  }
}
""",

"src/app/services/scraper.service.ts": """import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ScrapedProduct {
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  oriflameUrl: string;
}

@Injectable({ providedIn: 'root' })
export class ScraperService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api';

  scrapeCategory(categoryUrl: string): Observable<ScrapedProduct[]> {
    return this.http.post<ScrapedProduct[]>(`${this.apiUrl}/scraper/scrape`, { url: categoryUrl });
  }

  getScrapeStatus(): Observable<{ status: string; count: number }> {
    return this.http.get<{ status: string; count: number }>(`${this.apiUrl}/scraper/status`);
  }

  importProducts(products: ScrapedProduct[]): Observable<{ imported: number }> {
    return this.http.post<{ imported: number }>(`${this.apiUrl}/scraper/import`, { products });
  }
}
""",

# ============================================================
# GUARDS
# ============================================================

"src/app/guards/seller-auth.guard.ts": """import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const sellerAuthGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn()) return true;
  router.navigate(['/seller/login']);
  return false;
};
""",

# ============================================================
# SHARED COMPONENTS
# ============================================================

"src/app/components/navbar/navbar.component.ts": """import { Component, inject } from '@angular/core';
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
          <a routerLink="/" class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
              <span class="text-white font-display font-bold text-sm">G</span>
            </div>
            <span class="font-display text-xl font-bold gradient-text">GlowMart</span>
          </a>

          <!-- Nav Links -->
          <div class="hidden md:flex items-center gap-8">
            <a routerLink="/" routerLinkActive="text-brand-400" [routerLinkActiveOptions]="{exact:true}"
               class="text-sm font-body text-gray-300 hover:text-white transition-colors">Home</a>
            <a routerLink="/products" routerLinkActive="text-brand-400"
               class="text-sm font-body text-gray-300 hover:text-white transition-colors">Products</a>
            <a href="#about"
               class="text-sm font-body text-gray-300 hover:text-white transition-colors">About</a>
          </div>

          <!-- Cart -->
          <a routerLink="/cart" class="relative flex items-center gap-2 px-4 py-2 rounded-full glass hover:border-brand-500/40 transition-all">
            <svg class="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span class="text-sm text-gray-300 font-body">Cart</span>
            @if (cart.totalItems() > 0) {
              <span class="absolute -top-1 -right-1 w-5 h-5 bg-brand-500 rounded-full text-xs flex items-center justify-center font-bold animate-fade-up">
                {{ cart.totalItems() }}
              </span>
            }
          </a>

        </div>
      </div>
    </nav>
  `
})
export class NavbarComponent {
  cart = inject(CartService);
}
""",

"src/app/components/footer/footer.component.ts": """import { Component } from '@angular/core';
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
              Premium beauty & skincare products delivered to your door. No account needed — just shop and glow.
            </p>
          </div>

          <div>
            <h4 class="text-sm font-body font-semibold text-white mb-4 uppercase tracking-widest">Shop</h4>
            <ul class="space-y-2 text-sm text-gray-400 font-body">
              <li><a routerLink="/products" class="hover:text-brand-400 transition-colors">All Products</a></li>
              <li><a href="#" class="hover:text-brand-400 transition-colors">Skincare</a></li>
              <li><a href="#" class="hover:text-brand-400 transition-colors">Makeup</a></li>
              <li><a href="#" class="hover:text-brand-400 transition-colors">Fragrance</a></li>
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
""",

"src/app/components/product-card/product-card.component.ts": """import { Component, Input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Product } from '../../models/product.model';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <div class="glass rounded-2xl overflow-hidden card-hover group cursor-pointer">
      <a [routerLink]="['/product', product.id]">
        <div class="relative overflow-hidden aspect-square bg-dark-700">
          <img [src]="product.images[0]" [alt]="product.name"
               class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          <!-- Category badge -->
          <span class="absolute top-3 left-3 px-2 py-1 bg-brand-600/80 backdrop-blur-sm rounded-full text-xs font-body font-medium text-white">
            {{ product.category }}
          </span>

          <!-- Rating -->
          <div class="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-black/40 backdrop-blur-sm rounded-full">
            <svg class="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
            <span class="text-xs text-white font-body">{{ product.rating }}</span>
          </div>
        </div>
      </a>

      <div class="p-4">
        <a [routerLink]="['/product', product.id]">
          <h3 class="font-display text-base font-semibold text-white mb-1 line-clamp-1 hover:text-brand-300 transition-colors">
            {{ product.name }}
          </h3>
          <p class="text-gray-400 text-xs font-body line-clamp-2 mb-3">{{ product.description }}</p>
        </a>

        <div class="flex items-center justify-between">
          <div>
            <span class="text-brand-400 font-body font-bold text-lg">PKR {{ product.sellerPrice | number }}</span>
            <span class="text-gray-500 text-xs line-through ml-2 font-body">{{ product.originalPrice | number }}</span>
          </div>
          <button (click)="addToCart()"
            class="flex items-center gap-1 px-3 py-2 bg-brand-600 hover:bg-brand-500 rounded-xl text-xs font-body font-semibold text-white transition-all hover:shadow-lg hover:shadow-brand-500/30 active:scale-95">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Add
          </button>
        </div>
      </div>
    </div>
  `
})
export class ProductCardComponent {
  @Input() product!: Product;
  private cartService = inject(CartService);

  addToCart() {
    this.cartService.addToCart(this.product);
  }
}
""",

# ============================================================
# LAYOUTS
# ============================================================

"src/app/layouts/buyer-layout/buyer-layout.component.ts": """import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-buyer-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  template: `
    <div class="min-h-screen flex flex-col bg-dark-900">
      <app-navbar />
      <main class="flex-1 pt-16">
        <router-outlet />
      </main>
      <app-footer />
    </div>
  `
})
export class BuyerLayoutComponent {}
""",

"src/app/layouts/seller-layout/seller-layout.component.ts": """import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-seller-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen bg-dark-900 flex">

      <!-- Sidebar -->
      <aside class="w-64 bg-dark-800 border-r border-white/5 flex flex-col fixed top-0 bottom-0 left-0 z-40">
        <div class="h-16 flex items-center px-6 border-b border-white/5">
          <span class="font-display text-lg font-bold gradient-text">GlowMart</span>
          <span class="ml-2 text-xs font-mono text-gray-500 bg-dark-700 px-2 py-0.5 rounded">Seller</span>
        </div>

        <nav class="flex-1 p-4 space-y-1">
          @for (link of navLinks; track link.path) {
            <a [routerLink]="link.path" routerLinkActive="bg-brand-600/20 text-brand-300 border-brand-500/40"
               class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all border border-transparent">
              <span class="text-lg">{{ link.icon }}</span>
              {{ link.label }}
            </a>
          }
        </nav>

        <div class="p-4 border-t border-white/5">
          <button (click)="auth.logout()"
            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
            <span class="text-lg">🚪</span> Logout
          </button>
        </div>
      </aside>

      <!-- Main -->
      <div class="ml-64 flex-1 min-h-screen">
        <header class="h-16 bg-dark-800 border-b border-white/5 flex items-center px-8">
          <h1 class="text-sm font-body text-gray-400">Seller Panel</h1>
        </header>
        <main class="p-8">
          <router-outlet />
        </main>
      </div>

    </div>
  `
})
export class SellerLayoutComponent {
  auth = inject(AuthService);
  navLinks = [
    { path: '/seller/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/seller/products', icon: '📦', label: 'Products' },
    { path: '/seller/orders', icon: '🛍️', label: 'Orders' },
    { path: '/seller/scraper', icon: '🕷️', label: 'Scraper' },
  ];
}
""",

# ============================================================
# BUYER PAGES
# ============================================================

"src/app/pages/buyer/home/home.component.ts": """import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductCardComponent } from '../../../components/product-card/product-card.component';
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule, ProductCardComponent],
  template: `
    <!-- Hero -->
    <section class="relative min-h-[90vh] flex items-center overflow-hidden">
      <!-- Background mesh -->
      <div class="absolute inset-0">
        <div class="absolute top-20 left-1/4 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl"></div>
        <div class="absolute bottom-20 right-1/4 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl"></div>
        <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-900/10 via-dark-900 to-dark-900"></div>
      </div>

      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div class="max-w-2xl animate-fade-up">
          <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-body font-medium mb-6">
            ✨ Premium Beauty — No Sign-up Required
          </span>
          <h1 class="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
            Glow Different.<br/>
            <span class="gradient-text">Shop Freely.</span>
          </h1>
          <p class="text-gray-400 text-lg font-body leading-relaxed mb-8">
            Premium skincare, makeup and fragrance. No account needed — just browse, order, and we deliver to your door. Cash on delivery available.
          </p>
          <div class="flex flex-wrap gap-4">
            <a routerLink="/products"
               class="px-8 py-4 bg-brand-600 hover:bg-brand-500 rounded-2xl font-body font-semibold text-white transition-all hover:shadow-2xl hover:shadow-brand-500/30 hover:-translate-y-0.5">
              Shop Now →
            </a>
            <a href="#categories"
               class="px-8 py-4 glass hover:border-white/20 rounded-2xl font-body font-medium text-gray-300 hover:text-white transition-all">
              Browse Categories
            </a>
          </div>

          <!-- Trust badges -->
          <div class="flex flex-wrap gap-6 mt-10">
            @for (badge of badges; track badge.label) {
              <div class="flex items-center gap-2 text-sm font-body text-gray-400">
                <span>{{ badge.icon }}</span>
                <span>{{ badge.label }}</span>
              </div>
            }
          </div>
        </div>
      </div>
    </section>

    <!-- Categories -->
    <section id="categories" class="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 class="font-display text-3xl font-bold text-white mb-8">Shop by Category</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        @for (cat of categories; track cat.name) {
          <a routerLink="/products" [queryParams]="{category: cat.name}"
             class="glass rounded-2xl p-6 text-center card-hover group">
            <span class="text-4xl mb-3 block">{{ cat.icon }}</span>
            <span class="font-body font-medium text-white group-hover:text-brand-300 transition-colors">{{ cat.name }}</span>
          </a>
        }
      </div>
    </section>

    <!-- Featured Products -->
    <section class="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-end justify-between mb-8">
        <div>
          <h2 class="font-display text-3xl font-bold text-white">Featured Products</h2>
          <p class="text-gray-400 font-body mt-1">Handpicked bestsellers just for you</p>
        </div>
        <a routerLink="/products" class="text-brand-400 hover:text-brand-300 font-body text-sm transition-colors">View all →</a>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (product of products(); track product.id) {
          <app-product-card [product]="product" />
        }
      </div>
    </section>

    <!-- How it works -->
    <section class="py-20 bg-dark-800/50 border-y border-white/5">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="font-display text-3xl font-bold text-white text-center mb-12">How It Works</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          @for (step of steps; track step.no) {
            <div class="text-center">
              <div class="w-14 h-14 rounded-2xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center mx-auto mb-4 text-2xl">
                {{ step.icon }}
              </div>
              <h3 class="font-display font-semibold text-white mb-2">{{ step.title }}</h3>
              <p class="text-gray-400 font-body text-sm leading-relaxed">{{ step.desc }}</p>
            </div>
          }
        </div>
      </div>
    </section>
  `
})
export class HomeComponent implements OnInit {
  private productService = inject(ProductService);
  products = signal<Product[]>([]);

  badges = [
    { icon: '🚚', label: 'Free delivery over PKR 2000' },
    { icon: '💳', label: 'Cash on Delivery' },
    { icon: '↩️', label: '7-day returns' },
    { icon: '✅', label: '100% Original' },
  ];

  categories = [
    { name: 'Skincare', icon: '🧴' },
    { name: 'Makeup', icon: '💄' },
    { name: 'Fragrance', icon: '🌸' },
    { name: 'Haircare', icon: '💆' },
  ];

  steps = [
    { no: 1, icon: '🛒', title: 'Browse & Select', desc: 'Explore our curated collection of premium beauty products. No login required.' },
    { no: 2, icon: '📦', title: 'Place Your Order', desc: 'Add to cart, fill in your address and phone number — done in 60 seconds.' },
    { no: 3, icon: '🚪', title: 'We Deliver', desc: 'Your order arrives at your door. Pay cash on delivery. Simple.' },
  ];

  ngOnInit() {
    this.productService.getProducts().subscribe(p => this.products.set(p.slice(0, 6)));
  }
}
""",

"src/app/pages/buyer/products/products.component.ts": """import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductCardComponent } from '../../../components/product-card/product-card.component';
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductCardComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      <!-- Header -->
      <div class="mb-10">
        <h1 class="font-display text-4xl font-bold text-white mb-2">All Products</h1>
        <p class="text-gray-400 font-body">{{ filtered().length }} products found</p>
      </div>

      <div class="flex flex-col lg:flex-row gap-8">

        <!-- Filters -->
        <aside class="w-full lg:w-56 flex-shrink-0">
          <div class="glass rounded-2xl p-5 sticky top-20">
            <h3 class="font-body font-semibold text-white mb-4 text-sm uppercase tracking-widest">Filters</h3>

            <!-- Search -->
            <div class="mb-4">
              <input type="text" [(ngModel)]="searchQuery" placeholder="Search products..."
                class="w-full bg-dark-700 border border-white/10 rounded-xl px-3 py-2 text-sm font-body text-white placeholder-gray-500 focus:outline-none focus:border-brand-500/50" />
            </div>

            <!-- Categories -->
            <div class="mb-4">
              <p class="text-xs font-body text-gray-500 uppercase tracking-widest mb-2">Category</p>
              <div class="space-y-1">
                <button (click)="selectedCategory = ''"
                  [class.text-brand-400]="selectedCategory === ''"
                  class="w-full text-left text-sm font-body text-gray-400 hover:text-white transition-colors py-1">All</button>
                @for (cat of categories(); track cat) {
                  <button (click)="selectedCategory = cat"
                    [class.text-brand-400]="selectedCategory === cat"
                    class="w-full text-left text-sm font-body text-gray-400 hover:text-white transition-colors py-1">
                    {{ cat }}
                  </button>
                }
              </div>
            </div>

            <!-- Sort -->
            <div>
              <p class="text-xs font-body text-gray-500 uppercase tracking-widest mb-2">Sort by</p>
              <select [(ngModel)]="sortBy"
                class="w-full bg-dark-700 border border-white/10 rounded-xl px-3 py-2 text-sm font-body text-white focus:outline-none focus:border-brand-500/50">
                <option value="default">Default</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>
        </aside>

        <!-- Grid -->
        <div class="flex-1">
          @if (filtered().length === 0) {
            <div class="text-center py-20 text-gray-500 font-body">No products found.</div>
          } @else {
            <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              @for (product of filtered(); track product.id) {
                <app-product-card [product]="product" />
              }
            </div>
          }
        </div>

      </div>
    </div>
  `
})
export class ProductsComponent implements OnInit {
  private productService = inject(ProductService);
  allProducts = signal<Product[]>([]);
  categories = signal<string[]>([]);
  searchQuery = '';
  selectedCategory = '';
  sortBy = 'default';

  filtered = computed(() => {
    let items = this.allProducts();
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      items = items.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    if (this.selectedCategory) {
      items = items.filter(p => p.category === this.selectedCategory);
    }
    if (this.sortBy === 'price-asc') items = [...items].sort((a, b) => a.sellerPrice - b.sellerPrice);
    if (this.sortBy === 'price-desc') items = [...items].sort((a, b) => b.sellerPrice - a.sellerPrice);
    if (this.sortBy === 'rating') items = [...items].sort((a, b) => b.rating - a.rating);
    return items;
  });

  ngOnInit() {
    this.productService.getProducts().subscribe(p => this.allProducts.set(p));
    this.productService.getCategories().subscribe(c => this.categories.set(c));
  }
}
""",

"src/app/pages/buyer/product-detail/product-detail.component.ts": """import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../services/product.service';
import { CartService } from '../../../services/cart.service';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      @if (product()) {
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">

          <!-- Images -->
          <div class="space-y-4">
            <div class="aspect-square rounded-2xl overflow-hidden bg-dark-700">
              <img [src]="product()!.images[0]" [alt]="product()!.name"
                   class="w-full h-full object-cover" />
            </div>
          </div>

          <!-- Details -->
          <div class="flex flex-col justify-center">
            <span class="text-brand-400 text-sm font-body font-medium uppercase tracking-widest mb-2">{{ product()!.category }}</span>
            <h1 class="font-display text-3xl lg:text-4xl font-bold text-white mb-4">{{ product()!.name }}</h1>

            <!-- Rating -->
            <div class="flex items-center gap-3 mb-6">
              <div class="flex">
                @for (s of [1,2,3,4,5]; track s) {
                  <svg class="w-4 h-4" [class.text-yellow-400]="s <= product()!.rating" [class.text-gray-600]="s > product()!.rating" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                }
              </div>
              <span class="text-gray-400 text-sm font-body">{{ product()!.rating }} ({{ product()!.reviews }} reviews)</span>
            </div>

            <p class="text-gray-300 font-body leading-relaxed mb-8">{{ product()!.description }}</p>

            <!-- Price -->
            <div class="flex items-baseline gap-3 mb-8">
              <span class="font-display text-3xl font-bold text-brand-400">PKR {{ product()!.sellerPrice | number }}</span>
              <span class="font-body text-gray-500 line-through">{{ product()!.originalPrice | number }}</span>
              <span class="text-green-400 text-sm font-body font-medium">
                {{ discount() }}% OFF
              </span>
            </div>

            <!-- Quantity -->
            <div class="flex items-center gap-4 mb-6">
              <span class="text-sm font-body text-gray-400">Quantity:</span>
              <div class="flex items-center gap-2 glass rounded-xl px-1">
                <button (click)="qty > 1 ? qty = qty - 1 : null" class="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors">−</button>
                <span class="w-8 text-center font-body font-medium text-white">{{ qty }}</span>
                <button (click)="qty = qty + 1" class="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors">+</button>
              </div>
            </div>

            <!-- Add to cart -->
            <div class="flex gap-3">
              <button (click)="addToCart()"
                class="flex-1 py-4 bg-brand-600 hover:bg-brand-500 rounded-2xl font-body font-semibold text-white transition-all hover:shadow-xl hover:shadow-brand-500/30 active:scale-98">
                🛒 Add to Cart
              </button>
              <a routerLink="/cart"
                class="px-6 py-4 glass hover:border-white/20 rounded-2xl font-body font-medium text-gray-300 hover:text-white transition-all">
                View Cart
              </a>
            </div>

            <!-- Tags -->
            <div class="flex flex-wrap gap-2 mt-6">
              @for (tag of product()!.tags; track tag) {
                <span class="px-3 py-1 bg-dark-700 rounded-full text-xs font-body text-gray-400">#{{ tag }}</span>
              }
            </div>
          </div>
        </div>
      } @else {
        <div class="text-center py-20 text-gray-500 font-body">Loading product...</div>
      }
    </div>
  `
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  product = signal<Product | undefined>(undefined);
  qty = 1;

  discount = () => {
    const p = this.product();
    if (!p) return 0;
    return Math.round((1 - p.sellerPrice / p.originalPrice) * 100);
  };

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.productService.getProductById(id).subscribe(p => this.product.set(p));
  }

  addToCart() {
    if (this.product()) {
      this.cartService.addToCart(this.product()!, this.qty);
    }
  }
}
""",

"src/app/pages/buyer/cart/cart.component.ts": """import { Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 class="font-display text-3xl font-bold text-white mb-8">Your Cart</h1>

      @if (cart.items().length === 0) {
        <div class="text-center py-20 glass rounded-2xl">
          <p class="text-5xl mb-4">🛒</p>
          <p class="text-gray-400 font-body mb-6">Your cart is empty</p>
          <a routerLink="/products" class="px-6 py-3 bg-brand-600 hover:bg-brand-500 rounded-xl font-body font-medium text-white transition-all">
            Browse Products
          </a>
        </div>
      } @else {
        <div class="space-y-4 mb-8">
          @for (item of cart.items(); track item.product.id) {
            <div class="glass rounded-2xl p-4 flex items-center gap-4">
              <img [src]="item.product.images[0]" [alt]="item.product.name"
                   class="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
              <div class="flex-1 min-w-0">
                <h3 class="font-display font-semibold text-white truncate">{{ item.product.name }}</h3>
                <p class="text-brand-400 font-body font-bold">PKR {{ item.product.sellerPrice | number }}</p>
              </div>
              <div class="flex items-center gap-2 glass rounded-xl px-1">
                <button (click)="cart.updateQuantity(item.product.id, item.quantity - 1)"
                  class="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white">−</button>
                <span class="w-6 text-center text-sm font-body text-white">{{ item.quantity }}</span>
                <button (click)="cart.updateQuantity(item.product.id, item.quantity + 1)"
                  class="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white">+</button>
              </div>
              <span class="font-body font-semibold text-white w-24 text-right">
                PKR {{ (item.product.sellerPrice * item.quantity) | number }}
              </span>
              <button (click)="cart.removeFromCart(item.product.id)"
                class="text-gray-500 hover:text-red-400 transition-colors ml-2">✕</button>
            </div>
          }
        </div>

        <!-- Summary -->
        <div class="glass rounded-2xl p-6">
          <div class="flex justify-between items-center mb-2 font-body text-gray-400">
            <span>Subtotal</span>
            <span>PKR {{ cart.totalPrice() | number }}</span>
          </div>
          <div class="flex justify-between items-center mb-2 font-body text-gray-400">
            <span>Delivery</span>
            <span class="text-green-400">Free</span>
          </div>
          <div class="border-t border-white/5 my-4"></div>
          <div class="flex justify-between items-center mb-6">
            <span class="font-display text-lg font-bold text-white">Total</span>
            <span class="font-display text-2xl font-bold text-brand-400">PKR {{ cart.totalPrice() | number }}</span>
          </div>
          <a routerLink="/checkout"
            class="block w-full py-4 bg-brand-600 hover:bg-brand-500 rounded-2xl font-body font-semibold text-white text-center transition-all hover:shadow-xl hover:shadow-brand-500/30">
            Proceed to Checkout →
          </a>
        </div>
      }
    </div>
  `
})
export class CartComponent {
  cart = inject(CartService);
}
""",

"src/app/pages/buyer/checkout/checkout.component.ts": """import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../services/cart.service';
import { OrderService } from '../../../services/order.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  template: `
    <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 class="font-display text-3xl font-bold text-white mb-2">Checkout</h1>
      <p class="text-gray-400 font-body mb-8">No account needed. Fill in your details and we'll deliver!</p>

      <div class="space-y-5">
        <!-- Name -->
        <div class="glass rounded-2xl p-5">
          <label class="block text-sm font-body font-medium text-gray-300 mb-2">Full Name *</label>
          <input [(ngModel)]="form.name" type="text" placeholder="e.g. Fatima Khan"
            class="w-full bg-dark-700 border border-white/10 focus:border-brand-500/60 rounded-xl px-4 py-3 text-white font-body placeholder-gray-600 outline-none transition-colors" />
        </div>

        <!-- Phone -->
        <div class="glass rounded-2xl p-5">
          <label class="block text-sm font-body font-medium text-gray-300 mb-2">Phone Number *</label>
          <input [(ngModel)]="form.phone" type="tel" placeholder="03XX-XXXXXXX"
            class="w-full bg-dark-700 border border-white/10 focus:border-brand-500/60 rounded-xl px-4 py-3 text-white font-body placeholder-gray-600 outline-none transition-colors" />
        </div>

        <!-- City -->
        <div class="glass rounded-2xl p-5">
          <label class="block text-sm font-body font-medium text-gray-300 mb-2">City *</label>
          <input [(ngModel)]="form.city" type="text" placeholder="e.g. Karachi, Lahore, Islamabad"
            class="w-full bg-dark-700 border border-white/10 focus:border-brand-500/60 rounded-xl px-4 py-3 text-white font-body placeholder-gray-600 outline-none transition-colors" />
        </div>

        <!-- Address -->
        <div class="glass rounded-2xl p-5">
          <label class="block text-sm font-body font-medium text-gray-300 mb-2">Delivery Address *</label>
          <textarea [(ngModel)]="form.address" rows="3" placeholder="House/Flat no., Street, Area"
            class="w-full bg-dark-700 border border-white/10 focus:border-brand-500/60 rounded-xl px-4 py-3 text-white font-body placeholder-gray-600 outline-none transition-colors resize-none"></textarea>
        </div>

        <!-- Notes -->
        <div class="glass rounded-2xl p-5">
          <label class="block text-sm font-body font-medium text-gray-300 mb-2">Notes (optional)</label>
          <input [(ngModel)]="form.notes" type="text" placeholder="Any special instructions..."
            class="w-full bg-dark-700 border border-white/10 focus:border-brand-500/60 rounded-xl px-4 py-3 text-white font-body placeholder-gray-600 outline-none transition-colors" />
        </div>

        <!-- Order Summary -->
        <div class="glass rounded-2xl p-5">
          <h3 class="font-body font-semibold text-white mb-4">Order Summary</h3>
          @for (item of cart.items(); track item.product.id) {
            <div class="flex justify-between text-sm font-body text-gray-400 mb-1">
              <span>{{ item.product.name }} × {{ item.quantity }}</span>
              <span>PKR {{ (item.product.sellerPrice * item.quantity) | number }}</span>
            </div>
          }
          <div class="border-t border-white/5 my-3"></div>
          <div class="flex justify-between font-body font-bold text-white">
            <span>Total (COD)</span>
            <span class="text-brand-400">PKR {{ cart.totalPrice() | number }}</span>
          </div>
        </div>

        @if (error()) {
          <p class="text-red-400 text-sm font-body text-center">{{ error() }}</p>
        }

        <button (click)="placeOrder()" [disabled]="loading()"
          class="w-full py-4 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 rounded-2xl font-body font-semibold text-white text-center transition-all hover:shadow-xl hover:shadow-brand-500/30">
          @if (loading()) { Processing... } @else { Place Order — Cash on Delivery }
        </button>
      </div>
    </div>
  `
})
export class CheckoutComponent {
  cart = inject(CartService);
  private orderService = inject(OrderService);
  private router = inject(Router);

  form = { name: '', phone: '', city: '', address: '', notes: '' };
  loading = signal(false);
  error = signal('');

  placeOrder() {
    if (!this.form.name || !this.form.phone || !this.form.address || !this.form.city) {
      this.error.set('Please fill all required fields.');
      return;
    }
    this.loading.set(true);
    this.error.set('');
    const order = {
      buyerName: this.form.name,
      buyerPhone: this.form.phone,
      buyerAddress: this.form.address,
      buyerCity: this.form.city,
      notes: this.form.notes,
      items: this.cart.items().map(i => ({
        productId: i.product.id,
        productName: i.product.name,
        productImage: i.product.images[0],
        quantity: i.quantity,
        price: i.product.sellerPrice
      })),
      total: this.cart.totalPrice(),
      paymentMethod: 'cod' as const
    };
    this.orderService.placeOrder(order).subscribe({
      next: () => { this.cart.clearCart(); this.router.navigate(['/order-success']); },
      error: () => { this.loading.set(false); this.error.set('Failed to place order. Please try again.'); }
    });
  }
}
""",

"src/app/pages/buyer/order-success/order-success.component.ts": """import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-order-success',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="max-w-lg mx-auto px-4 py-24 text-center">
      <div class="w-24 h-24 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-6 text-5xl">
        ✅
      </div>
      <h1 class="font-display text-3xl font-bold text-white mb-3">Order Placed!</h1>
      <p class="text-gray-400 font-body mb-2">Thank you for your order. We'll call you soon to confirm.</p>
      <p class="text-gray-500 font-body text-sm mb-8">Payment: Cash on Delivery</p>
      <a routerLink="/" class="inline-block px-8 py-4 bg-brand-600 hover:bg-brand-500 rounded-2xl font-body font-semibold text-white transition-all">
        Continue Shopping →
      </a>
    </div>
  `
})
export class OrderSuccessComponent {}
""",

# ============================================================
# SELLER PAGES
# ============================================================

"src/app/pages/seller/seller-login/seller-login.component.ts": """import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-seller-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="min-h-screen bg-dark-900 flex items-center justify-center px-4">
      <div class="w-full max-w-md glass rounded-3xl p-8">
        <div class="text-center mb-8">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center mx-auto mb-4 text-2xl">💎</div>
          <h1 class="font-display text-2xl font-bold text-white">Seller Portal</h1>
          <p class="text-gray-400 font-body text-sm mt-1">GlowMart Admin Access</p>
        </div>

        <div class="space-y-4">
          <input type="email" [(ngModel)]="email" placeholder="Seller Email"
            class="w-full bg-dark-700 border border-white/10 focus:border-brand-500/60 rounded-xl px-4 py-3 text-white font-body placeholder-gray-600 outline-none transition-colors" />
          <input type="password" [(ngModel)]="password" placeholder="Password"
            class="w-full bg-dark-700 border border-white/10 focus:border-brand-500/60 rounded-xl px-4 py-3 text-white font-body placeholder-gray-600 outline-none transition-colors" />

          @if (error()) {
            <p class="text-red-400 text-sm font-body text-center">{{ error() }}</p>
          }

          <button (click)="login()"
            class="w-full py-3 bg-brand-600 hover:bg-brand-500 rounded-xl font-body font-semibold text-white transition-all hover:shadow-lg hover:shadow-brand-500/30">
            Login to Seller Panel
          </button>
        </div>

        <p class="text-center text-xs text-gray-600 font-mono mt-6">
          seller@glowmart.pk / seller123
        </p>
      </div>
    </div>
  `
})
export class SellerLoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  email = ''; password = ''; error = signal('');

  login() {
    if (this.auth.login(this.email, this.password)) {
      this.router.navigate(['/seller/dashboard']);
    } else {
      this.error.set('Invalid credentials.');
    }
  }
}
""",

"src/app/pages/seller/dashboard/dashboard.component.ts": """import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { OrderService } from '../../../services/order.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div>
      <h1 class="font-display text-3xl font-bold text-white mb-2">Dashboard</h1>
      <p class="text-gray-400 font-body mb-8">Welcome back to GlowMart Seller Panel</p>

      <!-- Stats -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        @for (stat of stats; track stat.label) {
          <div class="glass rounded-2xl p-5">
            <div class="flex items-center justify-between mb-3">
              <span class="text-2xl">{{ stat.icon }}</span>
              <span class="text-xs font-body font-medium px-2 py-0.5 rounded-full"
                [class.text-green-400]="stat.trend === 'up'"
                [class.bg-green-500]="stat.trend === 'up'"
                [class.bg-opacity-10]="true">
                ↑ {{ stat.change }}
              </span>
            </div>
            <p class="font-display text-2xl font-bold text-white">{{ stat.value }}</p>
            <p class="text-xs font-body text-gray-500 mt-1">{{ stat.label }}</p>
          </div>
        }
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <a routerLink="/seller/scraper" class="glass rounded-2xl p-5 card-hover flex items-center gap-4">
          <span class="text-3xl">🕷️</span>
          <div>
            <p class="font-body font-semibold text-white">Run Scraper</p>
            <p class="text-xs font-body text-gray-400">Import from Oriflame</p>
          </div>
        </a>
        <a routerLink="/seller/orders" class="glass rounded-2xl p-5 card-hover flex items-center gap-4">
          <span class="text-3xl">📋</span>
          <div>
            <p class="font-body font-semibold text-white">Manage Orders</p>
            <p class="text-xs font-body text-gray-400">Update order status</p>
          </div>
        </a>
        <a routerLink="/seller/products" class="glass rounded-2xl p-5 card-hover flex items-center gap-4">
          <span class="text-3xl">✏️</span>
          <div>
            <p class="font-body font-semibold text-white">Edit Products</p>
            <p class="text-xs font-body text-gray-400">Prices & descriptions</p>
          </div>
        </a>
      </div>
    </div>
  `
})
export class DashboardComponent {
  stats = [
    { icon: '📦', label: 'Total Products', value: '24', change: '3 new', trend: 'up' },
    { icon: '🛍️', label: 'Orders Today', value: '7', change: '2 pending', trend: 'up' },
    { icon: '💰', label: 'Revenue (PKR)', value: '42,800', change: '12%', trend: 'up' },
    { icon: '👥', label: 'Customers', value: '156', change: '8 new', trend: 'up' },
  ];
}
""",

"src/app/pages/seller/products/products.component.ts": """import { Component, OnInit, inject, signal } from '@angular/core';
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
          <p class="text-gray-400 font-body text-sm mt-1">Manage your product listings</p>
        </div>
      </div>

      <div class="glass rounded-2xl overflow-hidden">
        <table class="w-full">
          <thead class="border-b border-white/5">
            <tr class="text-left">
              <th class="px-6 py-4 text-xs font-body font-semibold text-gray-500 uppercase tracking-widest">Product</th>
              <th class="px-6 py-4 text-xs font-body font-semibold text-gray-500 uppercase tracking-widest">Category</th>
              <th class="px-6 py-4 text-xs font-body font-semibold text-gray-500 uppercase tracking-widest">Orig. Price</th>
              <th class="px-6 py-4 text-xs font-body font-semibold text-gray-500 uppercase tracking-widest">Sell Price</th>
              <th class="px-6 py-4 text-xs font-body font-semibold text-gray-500 uppercase tracking-widest">Stock</th>
              <th class="px-6 py-4 text-xs font-body font-semibold text-gray-500 uppercase tracking-widest">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5">
            @for (product of products(); track product.id) {
              <tr class="hover:bg-white/2 transition-colors">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <img [src]="product.images[0]" class="w-10 h-10 rounded-lg object-cover" />
                    <span class="font-body font-medium text-white text-sm">{{ product.name }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 text-sm font-body text-gray-400">{{ product.category }}</td>
                <td class="px-6 py-4 text-sm font-body text-gray-400">{{ product.originalPrice | number }}</td>
                <td class="px-6 py-4 text-sm font-body text-brand-400 font-semibold">{{ product.sellerPrice | number }}</td>
                <td class="px-6 py-4 text-sm font-body text-gray-400">{{ product.stock }}</td>
                <td class="px-6 py-4">
                  <span class="px-2 py-1 rounded-full text-xs font-body font-medium"
                    [class.bg-green-500]="product.isActive" [class.text-green-900]="product.isActive"
                    [class.bg-gray-600]="!product.isActive" [class.text-gray-300]="!product.isActive">
                    {{ product.isActive ? 'Active' : 'Hidden' }}
                  </span>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class SellerProductsComponent implements OnInit {
  private productService = inject(ProductService);
  products = signal<Product[]>([]);

  ngOnInit() {
    this.productService.getProducts().subscribe(p => this.products.set(p));
  }
}
""",

"src/app/pages/seller/orders/orders.component.ts": """import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Order } from '../../../models/order.model';

@Component({
  selector: 'app-seller-orders',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <h1 class="font-display text-3xl font-bold text-white mb-2">Orders</h1>
      <p class="text-gray-400 font-body text-sm mb-8">Manage customer orders</p>

      <!-- Status filter -->
      <div class="flex gap-2 mb-6 flex-wrap">
        @for (s of statuses; track s) {
          <button (click)="filter = s"
            [class.bg-brand-600]="filter === s" [class.text-white]="filter === s"
            [class.glass]="filter !== s" [class.text-gray-400]="filter !== s"
            class="px-4 py-2 rounded-xl text-sm font-body font-medium transition-all">
            {{ s }}
          </button>
        }
      </div>

      <div class="space-y-4">
        @for (order of mockOrders; track order.id) {
          <div class="glass rounded-2xl p-5">
            <div class="flex items-start justify-between flex-wrap gap-4">
              <div>
                <div class="flex items-center gap-3 mb-1">
                  <span class="font-mono text-xs text-gray-500">#{{ order.id }}</span>
                  <span class="px-2 py-0.5 rounded-full text-xs font-body font-medium"
                    [class.bg-yellow-500]="order.status==='pending'" [class.text-yellow-900]="order.status==='pending'"
                    [class.bg-blue-500]="order.status==='confirmed'" [class.text-blue-900]="order.status==='confirmed'"
                    [class.bg-green-500]="order.status==='delivered'" [class.text-green-900]="order.status==='delivered'">
                    {{ order.status | titlecase }}
                  </span>
                </div>
                <p class="font-body font-semibold text-white">{{ order.buyerName }}</p>
                <p class="font-body text-sm text-gray-400">📞 {{ order.buyerPhone }} — {{ order.buyerCity }}</p>
                <p class="font-body text-xs text-gray-500 mt-1">{{ order.buyerAddress }}</p>
              </div>
              <div class="text-right">
                <p class="font-display font-bold text-brand-400 text-lg">PKR {{ order.total | number }}</p>
                <p class="text-xs font-body text-gray-500">{{ order.items.length }} item(s) · COD</p>
                <div class="flex gap-2 mt-3">
                  <button class="px-3 py-1.5 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-body hover:bg-blue-600/30 transition-colors">Confirm</button>
                  <button class="px-3 py-1.5 bg-green-600/20 text-green-400 border border-green-500/30 rounded-lg text-xs font-body hover:bg-green-600/30 transition-colors">Mark Shipped</button>
                  <button class="px-3 py-1.5 bg-red-600/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-body hover:bg-red-600/30 transition-colors">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class SellerOrdersComponent {
  filter = 'All';
  statuses = ['All', 'Pending', 'Confirmed', 'Shipped', 'Delivered'];

  mockOrders = [
    {
      id: 'GM-001',
      buyerName: 'Ayesha Siddiqui',
      buyerPhone: '0312-3456789',
      buyerCity: 'Karachi',
      buyerAddress: 'House 12, Block 5, Gulshan-e-Iqbal',
      items: [{ productName: 'HydraFusion Night Cream', quantity: 2, price: 2200 }],
      total: 4400,
      status: 'pending' as const,
      paymentMethod: 'cod' as const,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'GM-002',
      buyerName: 'Sara Ahmed',
      buyerPhone: '0321-9876543',
      buyerCity: 'Lahore',
      buyerAddress: 'Flat 3B, DHA Phase 4',
      items: [{ productName: 'Velvet Rose Lipstick', quantity: 1, price: 950 }],
      total: 950,
      status: 'confirmed' as const,
      paymentMethod: 'cod' as const,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
}
""",

"src/app/pages/seller/scraper/scraper.component.ts": """import { Component, inject, signal } from '@angular/core';
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
""",

# ============================================================
# PYTHON BACKEND
# ============================================================

"backend/requirements.txt": """fastapi==0.115.0
uvicorn[standard]==0.30.6
httpx==0.27.0
beautifulsoup4==4.12.3
playwright==1.46.0
firebase-admin==6.5.0
python-dotenv==1.0.1
pydantic==2.9.2
""",

"backend/.env.example": """FIREBASE_SERVICE_ACCOUNT=path/to/serviceAccountKey.json
SECRET_KEY=your-secret-key-here
ALLOWED_ORIGINS=http://localhost:4200
""",

"backend/run.py": """import uvicorn

if __name__ == '__main__':
    uvicorn.run('app.main:app', host='0.0.0.0', port=8000, reload=True)
""",

"backend/app/__init__.py": "",

"backend/app/main.py": """from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

from app.routes import products, orders, scraper

app = FastAPI(title='GlowMart API', version='1.0.0')

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv('ALLOWED_ORIGINS', 'http://localhost:4200')],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(products.router, prefix='/api/products', tags=['products'])
app.include_router(orders.router, prefix='/api/orders', tags=['orders'])
app.include_router(scraper.router, prefix='/api/scraper', tags=['scraper'])

@app.get('/')
def root():
    return {'status': 'GlowMart API running 🌸'}
""",

"backend/app/models/__init__.py": "",

"backend/app/models/product.py": """from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class Product(BaseModel):
    id: Optional[str] = None
    name: str
    description: str
    originalPrice: float
    sellerPrice: float
    images: List[str] = []
    category: str
    tags: List[str] = []
    stock: int = 0
    rating: float = 0.0
    reviews: int = 0
    isActive: bool = True
    oriflameUrl: Optional[str] = None
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None
""",

"backend/app/models/order.py": """from pydantic import BaseModel
from typing import Optional, List, Literal
from datetime import datetime

class OrderItem(BaseModel):
    productId: str
    productName: str
    productImage: str
    quantity: int
    price: float

class Order(BaseModel):
    id: Optional[str] = None
    buyerName: str
    buyerPhone: str
    buyerAddress: str
    buyerCity: str
    items: List[OrderItem]
    total: float
    status: Literal['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] = 'pending'
    paymentMethod: Literal['cod'] = 'cod'
    notes: Optional[str] = None
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None
""",

"backend/app/routes/__init__.py": "",

"backend/app/routes/products.py": """from fastapi import APIRouter, HTTPException
from app.models.product import Product
from app.firebase_client import db
from datetime import datetime
import uuid

router = APIRouter()

@router.get('/', response_model=list[Product])
async def get_products():
    docs = db.collection('products').where('isActive', '==', True).stream()
    return [{'id': d.id, **d.to_dict()} for d in docs]

@router.get('/{product_id}', response_model=Product)
async def get_product(product_id: str):
    doc = db.collection('products').document(product_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail='Product not found')
    return {'id': doc.id, **doc.to_dict()}

@router.post('/', response_model=Product)
async def create_product(product: Product):
    product_id = str(uuid.uuid4())
    data = product.model_dump(exclude={'id'})
    data['createdAt'] = datetime.utcnow()
    data['updatedAt'] = datetime.utcnow()
    db.collection('products').document(product_id).set(data)
    return {'id': product_id, **data}

@router.put('/{product_id}', response_model=Product)
async def update_product(product_id: str, product: Product):
    data = product.model_dump(exclude={'id', 'createdAt'})
    data['updatedAt'] = datetime.utcnow()
    db.collection('products').document(product_id).update(data)
    return {'id': product_id, **data}

@router.delete('/{product_id}')
async def delete_product(product_id: str):
    db.collection('products').document(product_id).delete()
    return {'deleted': True}
""",

"backend/app/routes/orders.py": """from fastapi import APIRouter
from app.models.order import Order
from app.firebase_client import db
from datetime import datetime
import uuid

router = APIRouter()

@router.get('/', response_model=list[Order])
async def get_orders():
    docs = db.collection('orders').order_by('createdAt', direction='DESCENDING').stream()
    return [{'id': d.id, **d.to_dict()} for d in docs]

@router.post('/', response_model=Order)
async def place_order(order: Order):
    order_id = f'GM-{str(uuid.uuid4())[:6].upper()}'
    data = order.model_dump(exclude={'id'})
    data['status'] = 'pending'
    data['createdAt'] = datetime.utcnow()
    data['updatedAt'] = datetime.utcnow()
    db.collection('orders').document(order_id).set(data)
    return {'id': order_id, **data}

@router.patch('/{order_id}', response_model=Order)
async def update_order_status(order_id: str, payload: dict):
    db.collection('orders').document(order_id).update({
        'status': payload.get('status'),
        'updatedAt': datetime.utcnow()
    })
    doc = db.collection('orders').document(order_id).get()
    return {'id': doc.id, **doc.to_dict()}
""",

"backend/app/routes/scraper.py": """from fastapi import APIRouter, BackgroundTasks
from pydantic import BaseModel
from typing import List
from app.scraper.oriflame_scraper import scrape_oriflame_category
from app.firebase_client import db
from datetime import datetime
import uuid

router = APIRouter()

class ScrapeRequest(BaseModel):
    url: str

class ImportRequest(BaseModel):
    products: list

@router.post('/scrape')
async def scrape(request: ScrapeRequest):
    products = await scrape_oriflame_category(request.url)
    return products

@router.get('/status')
async def status():
    count = len(list(db.collection('products').stream()))
    return {'status': 'ready', 'count': count}

@router.post('/import')
async def import_products(request: ImportRequest):
    imported = 0
    for p in request.products:
        pid = str(uuid.uuid4())
        p['isActive'] = True
        p['stock'] = 20
        p['rating'] = 4.5
        p['reviews'] = 0
        p['createdAt'] = datetime.utcnow()
        p['updatedAt'] = datetime.utcnow()
        db.collection('products').document(pid).set(p)
        imported += 1
    return {'imported': imported}
""",

"backend/app/firebase_client.py": """import firebase_admin
from firebase_admin import credentials, firestore
import os

# Initialize Firebase
cred_path = os.getenv('FIREBASE_SERVICE_ACCOUNT', 'serviceAccountKey.json')

if not firebase_admin._apps:
    if os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
    else:
        # Use default credentials in CI/CD environments
        cred = credentials.ApplicationDefault()
    firebase_admin.initialize_app(cred)

db = firestore.client()
""",

"backend/app/scraper/__init__.py": "",

"backend/app/scraper/oriflame_scraper.py": """\"\"\"
Oriflame Product Scraper
Uses Playwright (headless browser) to scrape product data.
Run: playwright install chromium  (once)
\"\"\"
import asyncio
from playwright.async_api import async_playwright
from bs4 import BeautifulSoup
from typing import List, Dict

async def scrape_oriflame_category(url: str) -> List[Dict]:
    \"\"\"
    Scrape product listings from an Oriflame category page.
    Returns a list of product dicts.
    \"\"\"
    products = []

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        # Set headers to avoid bot detection
        await page.set_extra_http_headers({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })

        try:
            await page.goto(url, wait_until='networkidle', timeout=30000)
            await asyncio.sleep(3)  # Wait for dynamic content

            html = await page.content()
            soup = BeautifulSoup(html, 'html.parser')

            # NOTE: These selectors may need updating based on Oriflame's current HTML structure
            # Inspect the site and update accordingly
            product_cards = soup.select('.product-card, [class*="product-item"], [class*="ProductCard"]')

            for card in product_cards[:20]:  # Limit to 20 per scrape
                try:
                    name_el = card.select_one('[class*="product-name"], [class*="ProductName"], h3, h2')
                    price_el = card.select_one('[class*="price"], [class*="Price"]')
                    img_el = card.select_one('img')
                    link_el = card.select_one('a[href]')

                    name = name_el.get_text(strip=True) if name_el else 'Unknown Product'
                    price_text = price_el.get_text(strip=True) if price_el else '0'
                    price = float(''.join(filter(str.isdigit, price_text)) or 0)
                    image = img_el.get('src') or img_el.get('data-src', '') if img_el else ''
                    product_url = 'https://www.oriflame.com' + link_el['href'] if link_el else url

                    if name != 'Unknown Product':
                        products.append({
                            'name': name,
                            'description': f'Premium {name} from Oriflame. High quality beauty product.',
                            'price': price,
                            'originalPrice': price,
                            'sellerPrice': round(price * 0.85),  # 15% markup buffer
                            'images': [image] if image else [],
                            'category': 'Skincare',  # Will be auto-detected later
                            'tags': [],
                            'oriflameUrl': product_url,
                        })
                except Exception:
                    continue

        except Exception as e:
            print(f'Scraper error: {e}')
        finally:
            await browser.close()

    return products
""",

}

# ─────────────────────────────────────────────
# FILE WRITER
# ─────────────────────────────────────────────
def write_files():
    print("\n🌸 GlowMart — Project Scaffolding")
    print("=" * 50)
    created = 0
    for path, content in project_files.items():
        dir_name = os.path.dirname(path)
        if dir_name:
            os.makedirs(dir_name, exist_ok=True)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  ✅ {path}")
        created += 1
    print(f"\n✨ {created} files created successfully!\n")

# ─────────────────────────────────────────────
# DEPENDENCY INSTALLER
# ─────────────────────────────────────────────
def install_frontend_deps():
    print("📦 Installing frontend dependencies...")
    print("   (This may take 2-3 minutes)\n")
    result = subprocess.run(
        ['npm', 'install'],
        capture_output=False
    )
    if result.returncode == 0:
        print("\n✅ Frontend dependencies installed!\n")
    else:
        print("\n⚠️  npm install had issues. Try running 'npm install' manually.\n")

def install_backend_deps():
    print("🐍 Installing backend dependencies...")
    result = subprocess.run(
        [sys.executable, '-m', 'pip', 'install', '-r', 'backend/requirements.txt'],
        capture_output=False
    )
    if result.returncode == 0:
        print("\n✅ Backend dependencies installed!\n")
    else:
        print("\n⚠️  pip install had issues. Try running: pip install -r backend/requirements.txt\n")

# ─────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────
if __name__ == '__main__':
    write_files()
    install_frontend_deps()
    install_backend_deps()

    print("=" * 50)
    print("🚀 GLOWMART SCAFFOLD COMPLETE!")
    print("=" * 50)
    print("""
NEXT STEPS:
───────────
1. Configure Firebase:
   → Go to https://console.firebase.google.com
   → Create a new project
   → Download serviceAccountKey.json → put in backend/
   → Update src/app/services/firebase.config.ts

2. Run the backend:
   cd backend
   python run.py
   → API runs at http://localhost:8000

3. Run the frontend:
   ng serve --port 4200
   → Site runs at http://localhost:4200

4. Scraper setup (one time):
   pip install playwright
   playwright install chromium

SELLER PANEL:
─────────────
   URL:      http://localhost:4200/seller/login
   Email:    seller@glowmart.pk
   Password: seller123

BUYER SIDE (no login needed):
──────────────────────────────
   URL: http://localhost:4200
""")