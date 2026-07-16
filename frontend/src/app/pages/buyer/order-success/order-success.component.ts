import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-order-success',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  styles: [`
    .page { max-width: 520px; margin: 0 auto; padding: 3rem 1.25rem; text-align: center; }
    @media (max-width: 480px) {
      .page { padding: 2rem 1rem; }
      .page-title { font-size: 1.75rem; }
      .order-id-box { padding: 0.75rem 1.25rem; }
    }

    .success-ring {
      position: relative;
      width: 96px; height: 96px;
      margin: 0 auto 2.5rem;
    }
    .success-ring-outer {
      position: absolute; inset: 0;
      border-radius: 50%;
      border: 1px solid rgba(22,163,74,0.3);
      animation: ping 2s ease-in-out infinite;
    }
    @keyframes ping {
      0%, 100% { transform: scale(1); opacity: 0.6; }
      50% { transform: scale(1.12); opacity: 0.2; }
    }
    .success-ring-inner {
      position: relative;
      width: 96px; height: 96px;
      border-radius: 50%;
      background: rgba(22,163,74,0.08);
      border: 1px solid rgba(22,163,74,0.25);
      display: flex; align-items: center; justify-content: center;
    }

    .page-title {
      font-family: 'DM Serif Display', Georgia, serif;
      font-size: 2.5rem; font-weight: 400; color: #1a1410;
      margin-bottom: 0.75rem;
    }
    .page-sub {
      font-family: 'Inter', sans-serif; font-size: 1rem;
      color: #6b6560; margin-bottom: 0.375rem;
    }
    .page-note {
      font-family: 'Inter', sans-serif; font-size: 0.85rem;
      color: #9e9890; margin-bottom: 0.375rem;
    }

    .cod-badge {
      display: inline-flex; align-items: center; gap: 0.5rem;
      padding: 0.5rem 1.25rem;
      background: rgba(22,163,74,0.06);
      border: 1px solid rgba(22,163,74,0.2);
      font-family: 'Inter', sans-serif; font-size: 0.8rem;
      color: #16a34a; letter-spacing: 0.05em;
      margin-bottom: 2.5rem;
    }

    .order-id-box {
      display: inline-block;
      padding: 1rem 2rem;
      background: #f5f0e8;
      border: 1px solid #e8e0d6;
      margin-bottom: 2rem;
    }
    .order-id-label {
      font-family: 'Inter', sans-serif; font-size: 0.65rem;
      letter-spacing: 0.2em; text-transform: uppercase;
      color: #9e9890; margin-bottom: 0.375rem;
    }
    .order-id-value {
      font-family: 'DM Serif Display', serif;
      font-size: 1.25rem; font-weight: 600; color: #c9a96e;
      letter-spacing: 0.05em;
    }

    .steps-box {
      background: #f5f0e8;
      border: 1px solid #e8e0d6;
      padding: 1.75rem;
      margin-bottom: 1.5rem;
      text-align: left;
    }
    .steps-title {
      font-family: 'DM Serif Display', serif;
      font-size: 1.1rem; font-weight: 500; color: #1a1410;
      text-align: center; margin-bottom: 1.25rem;
    }
    .step-row {
      display: flex; align-items: flex-start; gap: 0.875rem;
      margin-bottom: 1rem;
    }
    .step-row:last-child { margin-bottom: 0; }
    .step-dot {
      width: 24px; height: 24px; border-radius: 50%;
      background: #1a1410;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; margin-top: 1px;
      font-family: 'Inter', sans-serif; font-size: 0.65rem;
      font-weight: 600; color: #faf7f4;
    }
    .step-title-text {
      font-family: 'Inter', sans-serif; font-size: 0.875rem;
      font-weight: 500; color: #1a1410;
    }
    .step-desc-text {
      font-family: 'Inter', sans-serif; font-size: 0.78rem;
      color: #9e9890; margin-top: 0.125rem;
    }

    .review-note {
      background: #fff;
      border: 1px solid #e8e0d6;
      padding: 1rem 1.25rem;
      margin-bottom: 2rem;
      display: flex; align-items: flex-start; gap: 0.75rem;
      text-align: left;
    }
    .review-note-text {
      font-family: 'Inter', sans-serif; font-size: 0.8rem;
      color: #6b6560; line-height: 1.6;
    }
  `],
  template: `
    <div class="page">

      <!-- Success icon -->
      <div class="success-ring">
        <div class="success-ring-outer"></div>
        <div class="success-ring-inner">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
      </div>

      <h1 class="page-title">Order Placed!</h1>
      <p class="page-sub">Thank you for shopping with Trendzy.</p>
      <p class="page-note">We'll call you shortly to confirm your order.</p>

      <div class="cod-badge">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
        </svg>
        Payment: Cash on Delivery
      </div>

      @if (orderId()) {
        <div class="order-id-box">
          <div class="order-id-label">Your Order ID</div>
          <div class="order-id-value">{{ orderId() }}</div>
        </div>
      }

      <div class="steps-box">
        <div class="steps-title">What happens next?</div>
        @for (step of steps; track step.no) {
          <div class="step-row">
            <div class="step-dot">{{ step.no }}</div>
            <div>
              <div class="step-title-text">{{ step.title }}</div>
              <div class="step-desc-text">{{ step.desc }}</div>
            </div>
          </div>
        }
      </div>

      <div class="review-note">
        <svg width="16" height="16" viewBox="0 0 20 20" fill="#c9a96e" style="flex-shrink:0;margin-top:1px;">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
        <p class="review-note-text">
          <strong style="color:#1a1410;">Leave a review</strong> after you receive your order.
          Genuine reviews help other customers make better choices.
        </p>
      </div>

      <a routerLink="/" class="btn-primary" style="display:inline-flex;">
        Continue Shopping
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
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
    { no: 4, title: 'Delivered',        desc: 'Pay cash and enjoy your Trendzy products!' },
  ];

  ngOnInit() {
    this.route.queryParams.subscribe(p => {
      if (p['id']) this.orderId.set(p['id']);
    });
  }
}
