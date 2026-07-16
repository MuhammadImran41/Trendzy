import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const buyerAuthGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) return true;

  // Save intended URL so we redirect back after login
  localStorage.setItem('trendzy_redirect', '/checkout');
  router.navigate(['/login']);
  return false;
};
