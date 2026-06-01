import { Routes } from '@angular/router';
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
