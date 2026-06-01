import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-order-success',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  template: `
    <div class="max-w-lg mx-auto px-4 py-20 text-center animate-fade-up">

      <!-- Success icon -->
      <div class="relative w-28 h-28 mx-auto mb-8">
        <div class="absolute inset-0 rounded-full bg-green-500/10 border border-green-500/20 animate-ping"
             style="animation-duration:2s;"></div>
        <div class="relative w-28 h-28 rounded-full bg-green-500/15 border border-green-500/30
                    flex items-center justify-center text-5xl">
          ✅
        </div>
      </div>

      <h1 class="font-display text-4xl font-bold text-white mb-3">Order Placed!</h1>
      <p class="text-gray-400 font-body mb-2 text-lg">
        Thank you for shopping with GlowMart.
      </p>
      <p class="text-gray-500 font-body text-sm mb-2">
        We'll call you shortly to confirm your order.
      </p>
      <p class="text-gray-600 font-body text-sm mb-10">
        💳 Payment: Cash on Delivery
      </p>

      <!-- Order ID if available -->
      @if (orderId()) {
        <div class="glass-card p-4 mb-8 inline-block">
          <p class="text-xs font-body text-gray-500 mb-1">Your Order ID</p>
          <p class="font-mono text-brand-400 font-bold text-lg">{{ orderId() }}</p>
        </div>
      }

      <!-- What happens next -->
      <div class="glass-card p-6 mb-8 text-left">
        <h3 class="font-display font-semibold text-white mb-4 text-center">What happens next?</h3>
        <div class="space-y-3">
          @for (step of steps; track step.no) {
            <div class="flex items-start gap-3">
              <div class="w-7 h-7 rounded-full bg-brand-600/20 border border-brand-500/30
                          flex items-center justify-center text-brand-300 text-xs font-bold flex-shrink-0 mt-0.5">
                {{ step.no }}
              </div>
              <div>
                <p class="font-body font-semibold text-white text-sm">{{ step.title }}</p>
                <p class="font-body text-gray-500 text-xs mt-0.5">{{ step.desc }}</p>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Review note -->
      <div class="glass-card p-4 mb-8 border border-brand-500/20">
        <p class="text-xs font-body text-gray-400 leading-relaxed">
          ⭐ <strong class="text-white">Leave a review</strong> after you receive your order.
          You'll be able to share your experience on the product page.
          Genuine reviews help other customers make better choices.
        </p>
      </div>

      <a routerLink="/" class="btn-primary inline-flex">
        Continue Shopping →
      </a>
    </div>
  `
})
export class OrderSuccessComponent implements OnInit {
  private route = inject(ActivatedRoute);
  orderId = signal('');

  steps = [
    { no: 1, title: 'Order Confirmed',  desc: 'We call you to confirm within a few hours.' },
    { no: 2, title: 'Dispatched',       desc: 'Your order is packed and handed to the courier.' },
    { no: 3, title: 'Out for Delivery', desc: 'Courier is on the way to your address.' },
    { no: 4, title: 'Delivered',        desc: 'Pay cash and enjoy your GlowMart products!' },
  ];

  ngOnInit() {
    // Order ID passed as query param from checkout
    this.route.queryParams.subscribe(p => {
      if (p['id']) this.orderId.set(p['id']);
    });
  }
}
