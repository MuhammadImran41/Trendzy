import { Component, inject, signal } from '@angular/core';
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
          Demo: seller&#64;glowmart.pk / seller123
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
