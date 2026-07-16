import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const sellerAuthGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token  = localStorage.getItem('trendzy_seller_token');

  if (token === 'seller_authenticated') return true;

  router.navigate(['/seller/login']);
  return false;
};
