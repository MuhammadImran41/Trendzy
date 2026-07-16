import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  styles: [`
    footer { background: #0f0d0a; color: #9e9890; }

    /* ── Top gold line ── */
    .gold-line { height: 2px; background: linear-gradient(90deg, transparent, #c9a96e, transparent); }

    /* ── Newsletter ── */
    .newsletter { background: #1a1410; padding: 2.5rem 2rem; border-bottom: 1px solid rgba(255,255,255,0.06); }
    .nl-inner { max-width: 1280px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; gap: 2rem; flex-wrap: wrap; }
    .nl-text h3 { font-family: 'DM Serif Display', serif; font-size: 1.4rem; color: #faf7f4; margin-bottom: 0.25rem; }
    .nl-text p { font-family: 'Inter', sans-serif; font-size: 0.82rem; color: #6b6560; }
    .nl-form { display: flex; gap: 0; }
    .nl-input { background: #0f0d0a; border: 1px solid #3a3530; border-right: none; padding: 0.7rem 1.25rem; font-family: 'Inter', sans-serif; font-size: 0.85rem; color: #faf7f4; outline: none; min-width: 260px; }
    .nl-input::placeholder { color: #4a4540; }
    .nl-btn { background: #c9a96e; color: #0f0d0a; border: none; padding: 0.7rem 1.5rem; font-family: 'Inter', sans-serif; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer; transition: background 0.2s; }
    .nl-btn:hover { background: #d4b87a; }
    @media (max-width: 640px) { .nl-inner { flex-direction: column; align-items: flex-start; } .nl-input { min-width: 200px; } }

    /* ── Main footer grid ── */
    .footer-main { max-width: 1280px; margin: 0 auto; padding: 4rem 2rem 3rem; display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr; gap: 3rem; }
    @media (max-width: 1100px) { .footer-main { grid-template-columns: 1fr 1fr 1fr; } }
    @media (max-width: 700px)  { .footer-main { grid-template-columns: 1fr 1fr; gap: 2rem; padding: 2.5rem 1.25rem; } }
    @media (max-width: 480px)  { .footer-main { grid-template-columns: 1fr; } }

    /* brand col */
    .brand-logo-row { display: flex; align-items: center; gap: 12px; margin-bottom: 1rem; }
    .brand-wordmark { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 700; letter-spacing: 4px; }
    .brand-wordmark .shop { color: #faf7f4; }
    .brand-wordmark .zee { background: linear-gradient(135deg, #8b6010, #c8920a, #7a5008); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .brand-tagline { font-family: 'Inter', sans-serif; font-size: 5px; letter-spacing: 2.5px; color: #c9a96e; text-transform: uppercase; }
    .brand-desc { font-family: 'Inter', sans-serif; font-size: 0.82rem; line-height: 1.8; color: #4a4540; margin-bottom: 1.5rem; }
    .brand-pills { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.75rem; }
    .brand-pill { display: flex; align-items: center; gap: 0.5rem; font-family: 'Inter', sans-serif; font-size: 0.75rem; color: #6b6560; }
    .brand-pill svg { flex-shrink: 0; }

    /* social */
    .social-row { display: flex; gap: 0.625rem; margin-top: 0.25rem; }
    .social-btn { width: 36px; height: 36px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.04); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; text-decoration: none; color: #6b6560; }
    .social-btn:hover { border-color: #c9a96e; color: #c9a96e; background: rgba(201,169,110,0.08); }

    /* columns */
    .col-title { font-family: 'Inter', sans-serif; font-size: 0.62rem; font-weight: 600; letter-spacing: 0.22em; text-transform: uppercase; color: #faf7f4; margin-bottom: 1.25rem; }
    .col-links { list-style: none; display: flex; flex-direction: column; gap: 0.7rem; }
    .col-links a, .col-links span, .col-links button { font-family: 'Inter', sans-serif; font-size: 0.82rem; color: #4a4540; text-decoration: none; transition: color 0.2s; cursor: pointer; background: none; border: none; padding: 0; text-align: left; }
    .col-links a:hover, .col-links span:hover, .col-links button:hover { color: #c9a96e; }

    /* bottom bar */
    .footer-bottom { border-top: 1px solid rgba(255,255,255,0.05); padding: 1.5rem 2rem; max-width: 1280px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; }
    .footer-copy { font-family: 'Inter', sans-serif; font-size: 0.72rem; color: #3a3530; }
    .footer-badges { display: flex; gap: 0.5rem; align-items: center; }
    .payment-badge { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); padding: 0.2rem 0.6rem; font-family: 'Inter', sans-serif; font-size: 0.65rem; color: #4a4540; border-radius: 3px; }
  `],
  template: `
    <footer>
      <div class="gold-line"></div>

      <!-- Newsletter -->
      <div class="newsletter">
        <div class="nl-inner">
          <div class="nl-text">
            <h3>Stay in the Loop</h3>
            <p>Get exclusive deals, new arrivals & offers straight to your inbox.</p>
          </div>
          <div class="nl-form">
            <input class="nl-input" type="email" [(ngModel)]="email" placeholder="Enter your email address" />
            <button class="nl-btn" (click)="subscribe()">Subscribe</button>
          </div>
        </div>
      </div>

      <!-- Main -->
      <div class="footer-main">

        <!-- Brand -->
        <div>
          <div class="brand-logo-row">
            <svg width="36" height="40" viewBox="0 0 84 96" fill="none">
              <rect x="6" y="30" width="72" height="58" rx="8" fill="#2a2520"/>
              <path d="M28 30 C28 14 56 14 56 30" stroke="#c8960c" stroke-width="5.5" stroke-linecap="round" fill="none"/>
              <rect x="6" y="30" width="72" height="8" rx="4" fill="#c8960c"/>
              <text x="35" y="74" font-family="Georgia,serif" font-size="28" font-weight="700" fill="#f5d160" text-anchor="middle">S</text>
              <text x="51" y="74" font-family="Georgia,serif" font-size="28" font-weight="700" fill="#ffffff" text-anchor="middle">Z</text>
            </svg>
            <div>
              <div class="brand-wordmark"><span class="shop">TREND</span><span class="zee">ZY</span></div>
              <div class="brand-tagline">Premium · Style · Delivered</div>
            </div>
          </div>
          <p class="brand-desc">Your one-stop shop for fashion, beauty, electronics & more. Delivered across Pakistan with cash on delivery.</p>
          <div class="brand-pills">
            <div class="brand-pill"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c9a96e" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"/></svg> Free delivery over PKR 2,000</div>
            <div class="brand-pill"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c9a96e" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> Cash on Delivery available</div>
            <div class="brand-pill"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c9a96e" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> 100% Original Products</div>
          </div>
          <!-- Social -->
          <div class="social-row">
            <a href="https://instagram.com" target="_blank" class="social-btn" title="Instagram">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </a>
            <a href="https://facebook.com" target="_blank" class="social-btn" title="Facebook">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
            </a>
            <a href="https://wa.me/923001234567" target="_blank" class="social-btn" title="WhatsApp">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>
            </a>
            <a href="https://tiktok.com" target="_blank" class="social-btn" title="TikTok">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z"/></svg>
            </a>
          </div>
        </div>

        <!-- Shop -->
        <div>
          <div class="col-title">Shop</div>
          <ul class="col-links">
            <li><a routerLink="/products">All Products</a></li>
            <li><a routerLink="/products" [queryParams]="{category:'Cosmetics'}">Cosmetics</a></li>
            <li><a routerLink="/products" [queryParams]="{category:'Electronics'}">Electronics</a></li>
            <li><a routerLink="/products" [queryParams]="{category:'Clothing'}">Clothing</a></li>
            <li><a routerLink="/products" [queryParams]="{category:'Footwear'}">Footwear</a></li>
            <li><a routerLink="/products" [queryParams]="{category:'Jewellery'}">Jewellery</a></li>
          </ul>
        </div>

        <!-- Customer Care -->
        <div>
          <div class="col-title">Customer Care</div>
          <ul class="col-links">
            <li><span>Track Your Order</span></li>
            <li><span>Returns & Refunds</span></li>
            <li><span>Cash on Delivery</span></li>
            <li><span>Delivery Info</span></li>
            <li><span>FAQs</span></li>
            <li><button (click)="openChat()">Live Chat Support</button></li>
          </ul>
        </div>

        <!-- Company -->
        <div>
          <div class="col-title">Company</div>
          <ul class="col-links">
            <li><span>About Trendzy</span></li>
            <li><span>Careers</span></li>
            <li><span>Press</span></li>
            <li><span>Privacy Policy</span></li>
            <li><span>Terms of Service</span></li>
          </ul>
        </div>

        <!-- Contact -->
        <div>
          <div class="col-title">Contact Us</div>
          <ul class="col-links">
            <li>
              <a href="https://wa.me/923001234567" target="_blank" style="display:flex;align-items:center;gap:0.5rem;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>
                +92 300 1234567
              </a>
            </li>
            <li>
              <a href="mailto:support@trendzy.pk" style="display:flex;align-items:center;gap:0.5rem;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                support&#64;trendzy.pk
              </a>
            </li>
            <li>
              <span style="display:flex;align-items:center;gap:0.5rem;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                Lahore, Pakistan
              </span>
            </li>
            <li>
              <span style="display:flex;align-items:center;gap:0.5rem;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
                Mon–Sat: 9am–9pm
              </span>
            </li>
          </ul>
        </div>

      </div>

      <!-- Bottom bar -->
      <div style="border-top:1px solid rgba(255,255,255,0.05);">
        <div class="footer-bottom">
          <span class="footer-copy">© 2025 Trendzy. All rights reserved.</span>
          <div class="footer-badges">
            <span class="payment-badge">Cash on Delivery</span>
            <span class="payment-badge">Easy Returns</span>
            <span class="payment-badge" style="color:#c9a96e;">Made in Pakistan 🇵🇰</span>
          </div>
        </div>
      </div>
    </footer>

    <!-- ── Help Center Chat Bot ── -->
    @if (chatOpen()) {
      <div style="position:fixed;bottom:90px;right:24px;width:340px;background:#fff;border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,0.18);z-index:9999;overflow:hidden;border:1px solid #e8e0d6;">
        <!-- header -->
        <div style="background:#1a1410;padding:1rem 1.25rem;display:flex;align-items:center;justify-content:space-between;">
          <div style="display:flex;align-items:center;gap:0.625rem;">
            <div style="width:38px;height:38px;background:linear-gradient(135deg,#c9a96e,#8b6914);border-radius:10px;display:flex;align-items:center;justify-content:center;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                <line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="13" y2="14"/>
              </svg>
            </div>
            <div>
              <div style="font-family:'DM Serif Display',serif;font-size:0.95rem;color:#faf7f4;">Trendzy Support</div>
              <div style="font-family:'Inter',sans-serif;font-size:0.65rem;color:#c9a96e;display:flex;align-items:center;gap:4px;"><span style="width:6px;height:6px;background:#22c55e;border-radius:50%;display:inline-block;"></span>Online now</div>
            </div>
          </div>
          <button (click)="chatOpen.set(false)" style="background:none;border:none;color:#6b6560;cursor:pointer;font-size:1.2rem;">✕</button>
        </div>
        <!-- messages -->
        <div style="height:280px;overflow-y:auto;padding:1rem;display:flex;flex-direction:column;gap:0.75rem;" #chatBox>
          @for (msg of chatMessages(); track $index) {
            <div [style.text-align]="msg.from==='bot' ? 'left' : 'right'">
              <div [style.background]="msg.from==='bot' ? '#f5f0e8' : '#1a1410'"
                   [style.color]="msg.from==='bot' ? '#1a1410' : '#faf7f4'"
                   style="display:inline-block;padding:0.6rem 0.875rem;border-radius:12px;max-width:85%;font-family:'Inter',sans-serif;font-size:0.8rem;line-height:1.5;text-align:left;">
                {{ msg.text }}
              </div>
            </div>
          }
        </div>
        <!-- quick replies -->
        <div style="padding:0 1rem 0.75rem;display:flex;flex-wrap:wrap;gap:0.375rem;">
          @for (q of quickReplies; track q) {
            <button (click)="sendQuick(q)" style="background:#f5f0e8;border:1px solid #e8e0d6;padding:0.3rem 0.75rem;border-radius:99px;font-family:'Inter',sans-serif;font-size:0.7rem;color:#6b6560;cursor:pointer;">{{ q }}</button>
          }
        </div>
        <!-- input -->
        <div style="padding:0.75rem;border-top:1px solid #f0ebe4;display:flex;gap:0.5rem;">
          <input [(ngModel)]="chatInput" (keyup.enter)="sendMsg()"
                 placeholder="Type a message..."
                 style="flex:1;background:#faf7f4;border:1px solid #e8e0d6;padding:0.5rem 0.875rem;border-radius:99px;font-family:'Inter',sans-serif;font-size:0.8rem;color:#1a1410;outline:none;" />
          <button (click)="sendMsg()" style="width:36px;height:36px;background:#c9a96e;border:none;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#fff;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
      </div>
    }

    <!-- Chat toggle button -->
    <button (click)="chatOpen.set(!chatOpen())"
            style="position:fixed;bottom:24px;right:24px;width:56px;height:56px;background:linear-gradient(135deg,#c9a96e,#8b6914);border:none;border-radius:16px;cursor:pointer;box-shadow:0 8px 24px rgba(201,169,110,0.4);display:flex;align-items:center;justify-content:center;z-index:9999;transition:transform 0.2s,border-radius 0.2s;"
            [style.border-radius]="chatOpen() ? '50%' : '16px'"
            title="Help Center">
      @if (!chatOpen()) {
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          <line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="13" y2="14"/>
        </svg>
      } @else {
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      }
    </button>
  `
})
export class FooterComponent {
  email     = '';
  chatOpen  = signal(false);
  chatInput = '';
  chatMessages = signal([
    { from: 'bot', text: 'Assalam o Alaikum! 👋 Welcome to Trendzy Help Center. I\'m here to help you with your orders, delivery, returns, and more. How can I assist you today?' }
  ]);

  quickReplies = ['Track my order', 'Return policy', 'Cash on Delivery', 'Delivery time', 'Contact support'];

  subscribe() {
    if (this.email) { alert(`Thank you! ${this.email} has been subscribed.`); this.email = ''; }
  }

  openChat() { this.chatOpen.set(true); }

  sendQuick(q: string) {
    this.addMsg(q, 'user');
    setTimeout(() => this.botReply(q), 600);
  }

  sendMsg() {
    const t = this.chatInput.trim();
    if (!t) return;
    this.chatInput = '';
    this.addMsg(t, 'user');
    setTimeout(() => this.botReply(t), 600);
  }

  addMsg(text: string, from: 'bot'|'user') {
    this.chatMessages.update(m => [...m, { from, text }]);
  }

  botReply(msg: string) {
    const m = msg.toLowerCase();
    let reply = '';

    if (m.includes('track') || m.includes('order id') || m.includes('where is my')) {
      reply = 'To track your order, please share your Order ID (format: SZ-XXXXXX). You can find it in your order confirmation. Our team will update you within minutes!';
    } else if (m.includes('return') || m.includes('refund') || m.includes('exchange')) {
      reply = 'Trendzy offers a 7-day easy return policy. Steps:\n1. WhatsApp us your Order ID\n2. Share reason + photo if defective\n3. We arrange free pickup\n4. Refund/exchange within 3-5 days.';
    } else if (m.includes('cash') || m.includes('cod') || m.includes('payment')) {
      reply = 'We accept Cash on Delivery (COD) across all of Pakistan. No advance payment or card required. You pay only when you receive your order!';
    } else if (m.includes('delivery') || m.includes('time') || m.includes('how long') || m.includes('shipping')) {
      reply = 'Delivery timelines:\n• Lahore/Karachi/Islamabad: 2-3 days\n• Other cities: 3-5 days\n• Remote areas: 5-7 days\nFree delivery on orders over PKR 2,000!';
    } else if (m.includes('cancel')) {
      reply = 'To cancel your order, please contact us within 2 hours of placing it. After dispatch, cancellation is not possible but you can return it within 7 days.';
    } else if (m.includes('contact') || m.includes('support') || m.includes('human') || m.includes('agent')) {
      reply = 'Connect with our team:\n📱 WhatsApp: +92 300 1234567\n✉️ Email: support@trendzy.pk\n⏰ Available Mon–Sat, 9am–9pm';
    } else if (m.includes('discount') || m.includes('coupon') || m.includes('promo') || m.includes('offer')) {
      reply = 'Current offers at Trendzy:\n• Free delivery on orders over PKR 2,000\n• Follow us on Instagram @trendzy.pk for exclusive promo codes\n• Newsletter subscribers get early access to sales!';
    } else if (m.includes('product') || m.includes('quality') || m.includes('original')) {
      reply = 'All Trendzy products are 100% original and quality-checked before dispatch. We source directly from verified suppliers. Not satisfied? Return within 7 days!';
    } else if (m.includes('size') || m.includes('fit')) {
      reply = 'Size guides are available on each product page. If unsure, WhatsApp us the product name and we\'ll help you pick the right size!';
    } else if (m.includes('hello') || m.includes('hi') || m.includes('salam') || m.includes('hey')) {
      reply = 'Walaikum Assalam! 😊 Welcome to Trendzy. I\'m your virtual assistant. Ask me about orders, returns, delivery, payments or anything else!';
    } else {
      reply = 'Thank you for reaching out! For detailed help, please contact our support team:\n📱 WhatsApp: +92 300 1234567\n✉️ support@trendzy.pk\nWe\'re available Mon–Sat 9am–9pm.';
    }
    this.addMsg(reply, 'bot');
  }
}
