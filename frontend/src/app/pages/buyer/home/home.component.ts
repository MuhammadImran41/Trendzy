import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule, NgFor } from '@angular/common';
import { ProductCardComponent } from '../../../components/product-card/product-card.component';
import { ProductService } from '../../../services/product.service';
import { OrderService } from '../../../services/order.service';
import { CategoryService, Category } from '../../../services/category.service';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule, NgFor, ProductCardComponent],
  styles: [`

    /* ── Hero ─────────────────────────────────────────────── */
    .hero {
      min-height: 0;
      height: calc(100vh - 106px);
      max-height: 570px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      align-items: center;
      background: #faf7f4;
      overflow: hidden;
    }
    @media (max-width: 900px) {
      .hero { grid-template-columns: 1fr; height: auto; max-height: none; }
      .hero-carousel-side { display: none; }
    }
    @media (max-width: 768px) {
      .hero { padding-top: 1rem; padding-bottom: 1rem; }
      .hero-content { padding: 2rem 1.25rem 1.5rem 1.25rem !important; }
      .hero-btns { flex-direction: column; }
      .hero-btns a, .hero-btns button { width: 100%; justify-content: center; }
      .hero-stats { gap: 1.25rem; flex-wrap: wrap; }
      .stat-item { padding-right: 1.25rem; margin-right: 1.25rem; }
    }

    /* Left content */
    .hero-content {
      padding: 2rem 3rem 2rem 10rem;
      display: flex; flex-direction: column; justify-content: center;
    }
    @media (max-width: 1200px) { .hero-content { padding: 2rem 2rem 2rem 5rem; } }

    .hero-eyebrow {
      font-family: 'Inter', sans-serif;
      font-size: 0.7rem; font-weight: 500;
      letter-spacing: 0.3em; text-transform: uppercase;
      color: #c9a96e; margin-bottom: 0.75rem;
      display: flex; align-items: center; gap: 0.75rem;
    }
    .hero-eyebrow::after { content: ''; width: 40px; height: 1px; background: #c9a96e; }

    .hero-title {
      font-family: 'DM Serif Display', Georgia, serif;
      font-size: clamp(2.4rem, 4vw, 4rem);
      font-weight: 300; line-height: 1.05;
      color: #1a1410; margin-bottom: 1rem;
    }
    .hero-title em {
      font-style: italic; font-weight: 400;
      background: linear-gradient(135deg, #c9a96e, #8b6914);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }

    .hero-desc {
      font-family: 'Inter', sans-serif;
      font-size: 0.88rem; color: #6b6560;
      line-height: 1.7; max-width: 380px; margin-bottom: 1.75rem;
    }

    .hero-btns { display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 2rem; }

    .hero-stats {
      display: flex; gap: 0;
      padding-top: 1.5rem; border-top: 1px solid #ddd8d0;
    }
    .stat-item {
      display: flex; flex-direction: column;
      padding-right: 2rem; margin-right: 2rem;
      border-right: 1px solid #e8e0d6;
    }
    .stat-item:last-child { border-right: none; padding-right: 0; margin-right: 0; }
    .stat-num {
      font-family: 'DM Serif Display', serif;
      font-size: 1.75rem; font-weight: 400; line-height: 1;
      background: linear-gradient(135deg, #c9a96e, #8b6914);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }
    .stat-label {
      font-family: 'Inter', sans-serif; font-size: 0.6rem;
      letter-spacing: 0.18em; text-transform: uppercase; color: #9e9890; margin-top: 0.3rem;
    }

    /* ── Right: Cross Carousel ───────────────────────────── */
    .hero-carousel-side {
      position: relative;
      height: 100%;
      min-height: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      flex: 1.3;
      padding-right: 4rem;
    }

    .carousel-track {
      position: relative;
      width: 560px;
      height: 500px;
      flex-shrink: 0;
    }

    /* Base card — all same 160x200 */
    .c-card {
      position: absolute;
      width: 160px;
      height: 200px;
      border-radius: 12px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.65s cubic-bezier(0.4, 0, 0.2, 1);
      /* default center anchor */
      top: 50%;
      left: 50%;
      margin-top: -100px;
      margin-left: -80px;
    }

    .c-card img {
      width: 100%; height: 100%;
      object-fit: cover;
      display: block;
    }

    /* ── CENTER — bigger, sharp, elevated ── */
    .c-card.pos-center {
      width: 260px;
      height: 340px;
      margin-top: -170px;
      margin-left: -130px;
      transform: translate(0, 0) translateZ(0);
      z-index: 10;
      filter: none;
      box-shadow: 0 24px 60px rgba(26,20,16,0.30);
      border-radius: 16px;
    }

    /* ── TOP ── */
    .c-card.pos-top {
      transform: translate(0, -210px);
      z-index: 5;
      filter: blur(1.5px) brightness(0.6);
      opacity: 0.8;
    }

    /* ── BOTTOM ── */
    .c-card.pos-bottom {
      transform: translate(0, 210px);
      z-index: 5;
      filter: blur(1.5px) brightness(0.6);
      opacity: 0.8;
    }

    /* ── LEFT ── */
    .c-card.pos-left {
      transform: translate(-220px, 0);
      z-index: 5;
      filter: blur(1.5px) brightness(0.65);
      opacity: 0.85;
    }

    /* ── RIGHT ── */
    .c-card.pos-right {
      transform: translate(220px, 0);
      z-index: 5;
      filter: blur(1.5px) brightness(0.65);
      opacity: 0.85;
    }

    /* Hidden */
    .c-card.pos-hidden {
      transform: translate(0, 0) scale(0.2);
      z-index: 1;
      opacity: 0;
      pointer-events: none;
    }

    /* Label on active card only */
    .c-card-label {
      position: absolute;
      bottom: 0; left: 0; right: 0;
      padding: 1.5rem 1rem 1rem;
      background: linear-gradient(to top, rgba(26,20,16,0.85) 0%, transparent 100%);
      opacity: 0;
      transition: opacity 0.4s;
    }
    .c-card.pos-center .c-card-label { opacity: 1; }

    .c-label-cat {
      font-family: 'Inter', sans-serif; font-size: 0.6rem;
      letter-spacing: 0.2em; text-transform: uppercase;
      color: #c9a96e; margin-bottom: 0.2rem;
    }
    .c-label-name {
      font-family: 'DM Serif Display', serif; font-size: 1.1rem;
      font-weight: 500; color: #fff;
    }

    /* Dots */
    .carousel-dots {
      position: absolute; bottom: 1.5rem;
      width: 100%; display: flex; gap: 0.5rem;
      align-items: center; justify-content: center;
    }
    .cdot {
      width: 20px; height: 2px;
      background: #ddd8d0; border: none; padding: 0; cursor: pointer;
      transition: all 0.3s;
    }
    .cdot.active { width: 36px; background: #c9a96e; }

    /* ── Marquee ──────────────────────────────────────────── */
    .marquee-bar { padding: 0.75rem 0; overflow: hidden; border-top: 1px solid #e8e0d6; border-bottom: 1px solid #e8e0d6; background: #faf7f4; }
    .marquee-track { display: flex; gap: 2.5rem; align-items: center; width: max-content; animation: marqueeScroll 30s linear infinite; }
    .marquee-track:hover { animation-play-state: paused; }
    @keyframes marqueeScroll {
      0%   { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }

    /* ── Section header ───────────────────────────────────── */
    .section-header { text-align: center; margin-bottom: 3.5rem; }
    .section-eyebrow {
      font-family: 'Inter', sans-serif; font-size: 0.7rem; font-weight: 500;
      letter-spacing: 0.25em; text-transform: uppercase; color: #c9a96e; margin-bottom: 0.875rem;
    }
    .section-title {
      font-family: 'DM Serif Display', Georgia, serif;
      font-size: clamp(2rem, 3.5vw, 3rem); font-weight: 400; color: #1a1410; line-height: 1.15;
    }
    .section-title em { font-style: italic; }

    /* ── Category grid — Clean vertical ──────────────────── */
    .cat-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1.25rem; }
    @media (max-width: 768px) { .cat-grid { grid-template-columns: repeat(2,1fr); gap: 0.75rem; } }
    @media (max-width: 480px) { .cat-grid { grid-template-columns: 1fr; } }

    .cat-card {
      background: #fff; border: 1px solid #ede8e0; border-radius: 12px;
      padding: 1.5rem; cursor: pointer; text-decoration: none; display: flex;
      flex-direction: column; gap: 1rem;
      transition: box-shadow 0.25s, transform 0.25s, border-color 0.25s;
    }
    .cat-card:hover { box-shadow: 0 8px 32px rgba(26,20,16,0.09); transform: translateY(-3px); border-color: #c9a96e; }

    .cat-card-header { display: flex; align-items: center; justify-content: space-between; }
    .cat-card-left { display: flex; align-items: center; gap: 0.75rem; }
    .cat-card-icon {
      width: 44px; height: 44px; border-radius: 10px;
      background: linear-gradient(135deg, #f5f0e8, #ede8e0);
      display: flex; align-items: center; justify-content: center;
      font-size: 1.4rem; flex-shrink: 0;
    }
    .cat-card-title { font-family: 'DM Serif Display', serif; font-size: 1.05rem; color: #1a1410; line-height: 1.2; }
    .cat-card-sub { font-family: 'Inter', sans-serif; font-size: 0.65rem; color: #b0a898; margin-top: 2px; }
    .cat-card-arrow {
      width: 28px; height: 28px; border-radius: 50%;
      background: #f5f0e8; border: 1px solid #e8e0d6;
      display: flex; align-items: center; justify-content: center;
      color: #c9a96e; font-size: 1rem; flex-shrink: 0;
      transition: background 0.2s, color 0.2s;
    }
    .cat-card:hover .cat-card-arrow { background: #c9a96e; color: #fff; border-color: #c9a96e; }

    /* thin gold divider */
    .cat-card-divider { height: 1px; background: #f0ebe4; }

    /* subcategory tags */
    .cat-tags { display: flex; flex-wrap: wrap; gap: 0.4rem; }
    .cat-tag {
      font-family: 'Inter', sans-serif; font-size: 0.7rem; color: #6b6560;
      background: #f5f0e8; padding: 0.25rem 0.625rem; border-radius: 99px;
      border: 1px solid #ede8e0; transition: background 0.15s, color 0.15s;
    }
    .cat-card:hover .cat-tag { background: #faf7f4; }

    /* View More button */
    .view-more-wrap { text-align: center; margin-top: 2.5rem; }
    .view-more-btn {
      display: inline-flex; align-items: center; gap: 0.5rem;
      padding: 0.75rem 2.5rem; background: #1a1410; color: #faf7f4;
      font-family: 'Inter', sans-serif; font-size: 0.78rem; font-weight: 500;
      letter-spacing: 0.12em; text-transform: uppercase;
      border: none; cursor: pointer; text-decoration: none;
      transition: background 0.2s, transform 0.2s; border-radius: 2px;
    }
    .view-more-btn:hover { background: #2d2520; transform: translateY(-1px); }

    /* ── Products grid ────────────────────────────────────── */
    .products-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 2rem; }
    @media (max-width: 900px) { .products-grid { grid-template-columns: repeat(2,1fr); gap: 1.25rem; } }
    @media (max-width: 480px) { .products-grid { grid-template-columns: repeat(2,1fr); gap: 0.75rem; } }

    /* ── How it works ─────────────────────────────────────── */
    .hiw-section { background: #f5f0e8; padding: 7rem 2rem; position: relative; overflow: hidden; border-top: 1px solid #e8e0d6; border-bottom: 1px solid #e8e0d6; }
    .hiw-section::before {
      content: '';
      position: absolute; inset: 0;
      background: radial-gradient(ellipse 80% 50% at 50% 0%, rgba(201,169,110,0.1) 0%, transparent 70%);
      pointer-events: none;
    }
    .hiw-eyebrow {
      font-family: 'Inter', sans-serif; font-size: 0.65rem; font-weight: 600;
      letter-spacing: 0.3em; text-transform: uppercase; color: #c9a96e;
      margin-bottom: 1rem; display: flex; align-items: center; justify-content: center; gap: 0.75rem;
    }
    .hiw-eyebrow::before, .hiw-eyebrow::after { content: ''; width: 36px; height: 1px; background: rgba(201,169,110,0.5); }
    .hiw-title {
      font-family: 'DM Serif Display', Georgia, serif;
      font-size: clamp(2.2rem, 4vw, 3.2rem); font-weight: 400;
      color: #1a1410; text-align: center; margin-bottom: 0.75rem; line-height: 1.15;
    }
    .hiw-title em { font-style: italic; color: #c9a96e; }
    .hiw-sub {
      font-family: 'Inter', sans-serif; font-size: 0.9rem; color: #9e9890;
      text-align: center; margin-bottom: 4rem; max-width: 440px; margin-left: auto; margin-right: auto;
    }
    .hiw-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1.5px; max-width: 1100px; margin: 0 auto; }
    @media (max-width: 768px) { .hiw-grid { grid-template-columns: 1fr; gap: 1.5px; }
      .hiw-section { padding: 4rem 1.25rem; }
      .hiw-card { padding: 2rem 1.5rem; }
    }

    .hiw-card {
      position: relative;
      background: #fff;
      padding: 3rem 2.5rem 2.5rem;
      display: flex; flex-direction: column; align-items: flex-start;
      border: 1px solid #e8e0d6;
      transition: background 0.3s ease, box-shadow 0.3s ease;
      overflow: hidden;
    }
    .hiw-card::before {
      content: '';
      position: absolute; top: 0; left: 0; right: 0; height: 2px;
      background: linear-gradient(90deg, transparent, #c9a96e, transparent);
      opacity: 0; transition: opacity 0.3s;
    }
    .hiw-card:hover { background: #faf7f4; box-shadow: 0 12px 40px rgba(26,20,16,0.07); }
    .hiw-card:hover::before { opacity: 1; }

    .hiw-step-num {
      font-family: 'DM Serif Display', serif;
      font-size: 5rem; font-weight: 400; line-height: 1;
      background: linear-gradient(135deg, #c9a96e, #8b6914);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
      opacity: 0.5;
      position: absolute; top: 1.25rem; right: 1.75rem;
      transition: opacity 0.3s;
    }
    .hiw-card:hover .hiw-step-num { opacity: 0.8; }

    .hiw-icon-wrap {
      width: 56px; height: 56px;
      border: 1px solid rgba(201,169,110,0.3);
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 1.75rem;
      background: rgba(201,169,110,0.06);
      transition: all 0.3s;
    }
    .hiw-card:hover .hiw-icon-wrap {
      border-color: rgba(201,169,110,0.7);
      background: rgba(201,169,110,0.12);
    }

    .hiw-connector {
      position: absolute; top: 50%; right: -1px;
      width: 1.5px; height: 40px;
      background: linear-gradient(180deg, transparent, #c9a96e40, transparent);
      transform: translateY(-50%);
    }

    .hiw-card-title {
      font-family: 'DM Serif Display', Georgia, serif;
      font-size: 1.4rem; font-weight: 400; color: #1a1410;
      margin-bottom: 0.875rem; line-height: 1.2;
    }
    .hiw-card-desc {
      font-family: 'Inter', sans-serif;
      font-size: 0.855rem; color: #6b6560; line-height: 1.75;
    }
    .hiw-card-tag {
      margin-top: 1.75rem;
      display: inline-flex; align-items: center; gap: 0.4rem;
      font-family: 'Inter', sans-serif; font-size: 0.7rem; font-weight: 500;
      letter-spacing: 0.12em; text-transform: uppercase; color: #c9a96e;
    }

    /* ── CTA banner ───────────────────────────────────────── */
    .cta-banner { background: rgba(250,247,244,0.96); padding: 5rem 2rem; text-align: center; position: relative; overflow: hidden; border-top: 1px solid #e8e0d6; }
    .cta-banner::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, #c9a96e, transparent); pointer-events: none; }
    .cta-title { font-family: 'DM Serif Display', serif; font-size: clamp(2.5rem, 5vw, 4rem); font-weight: 300; color: #1a1410; line-height: 1.15; margin-bottom: 1.25rem; letter-spacing: 0.02em; }
    .cta-title em { font-style: italic; background: linear-gradient(135deg, #c9a96e, #8b6914); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .cta-sub { font-family: 'Inter', sans-serif; font-size: 0.85rem; letter-spacing: 0.1em; color: #6b6560; margin-bottom: 2.5rem; max-width: 400px; margin-left: auto; margin-right: auto; }
    .cta-eyebrow { font-family: 'Inter', sans-serif; font-size: 0.65rem; font-weight: 500; letter-spacing: 0.3em; text-transform: uppercase; color: #c9a96e; margin-bottom: 1.25rem; display: flex; align-items: center; justify-content: center; gap: 0.75rem; }
    .cta-eyebrow::before, .cta-eyebrow::after { content: ''; width: 40px; height: 1px; background: rgba(201,169,110,0.5); }
  `],
  template: `

    <!-- ══════════════════════════════════════════════ HERO ══ -->
    <section class="hero">

      <!-- Left: Content -->
      <div class="hero-content">
        <div class="hero-eyebrow">Everything in One Place</div>
        <h1 class="hero-title">
          Shop <em>Everything</em><br>You Love
        </h1>
        <p class="hero-desc">
          Fashion, beauty, kitchen, electronics, accessories &amp; more —
          all delivered to your door. Cash on delivery. No account needed.
        </p>
        <div class="hero-btns">
          <a routerLink="/products" class="btn-primary">Shop Now</a>
          <a href="#categories" class="btn-outline">Explore Categories</a>
        </div>
        <div class="hero-stats">
          @for (s of stats(); track s.label) {
            <div class="stat-item">
              <div class="stat-num">{{ s.num }}</div>
              <div class="stat-label">{{ s.label }}</div>
            </div>
          }
        </div>
      </div>

      <!-- Right: 3D Card Carousel -->
      <div class="hero-carousel-side">
        <div class="carousel-track">
          @for (slide of heroSlides(); track slide.id; let i = $index) {
            <div class="c-card" [ngClass]="getCardClass(i)" (click)="goToSlide(i)">
              <img [src]="slide.img" [alt]="slide.name" loading="lazy" />
              <div class="c-card-label">
                <div class="c-label-cat">{{ slide.category }}</div>
                <div class="c-label-name">{{ slide.name }}</div>
              </div>
            </div>
          }
        </div>

      
      </div>

    </section>

    <!-- ══════════════════════════════════════════ MARQUEE ══ -->
    <div class="marquee-bar">
      <div class="marquee-track">
        @for (item of marqueeItems.concat(marqueeItems); track $index) {
          <span style="font-family:'Inter', sans-serif;font-size:11px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:#1a1410;white-space:nowrap;flex-shrink:0;display:flex;align-items:center;gap:0.6rem;">
            <svg width="6" height="6" viewBox="0 0 8 8" fill="#c9a96e"><rect x="4" y="0" width="5.66" height="5.66" transform="rotate(45 4 0)"/></svg>
            {{ item }}
          </span>
        }
      </div>
    </div>

    <!-- ══════════════════════════════════════════ CATEGORIES ══ -->
    <section id="categories" style="padding:4rem 1.5rem;max-width:1280px;margin:0 auto;">
      <div class="section-header">
        <div class="section-eyebrow">Browse</div>
        <h2 class="section-title">Shop by <em>Category</em></h2>
      </div>
      <div class="cat-grid">
        @if (categories().length === 0) {
          <div style="grid-column:1/-1;text-align:center;padding:3rem;color:#9e9890;font-family:'Inter',sans-serif;font-size:0.9rem;">
            No categories yet — add products from seller panel to see categories here.
          </div>
        }
        @for (cat of categories().slice(0, 6); track cat.name) {
          <a routerLink="/products" [queryParams]="{category: cat.name}" class="cat-card">
            <div class="cat-card-header">
              <div class="cat-card-left">
                <div class="cat-card-icon">{{ cat.icon }}</div>
                <div>
                  <div class="cat-card-title">{{ cat.name }}</div>
                  <div class="cat-card-sub">{{ cat.subcategories?.length || 0 }} subcategories</div>
                </div>
              </div>
              <div class="cat-card-arrow">›</div>
            </div>
            <div class="cat-card-divider"></div>
            <div class="cat-tags">
              @for (sub of (cat.subcategories || []).slice(0, 6); track sub) {
                <span class="cat-tag">{{ sub }}</span>
              }
            </div>
          </a>
        }
      </div>

      <!-- View More -->
      <div class="view-more-wrap">
        <a routerLink="/products" class="view-more-btn">
          View All Categories
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>
      </div>
    </section>

    <!-- ══════════════════════════════════════════ PRODUCTS ══ -->
    <section style="padding:4rem 1.5rem;max-width:1280px;margin:0 auto;">
      <div style="display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:3.5rem;flex-wrap:wrap;gap:1rem;">
        <div>
          <div class="section-eyebrow" style="text-align:left;">Curated Selection</div>
          <h2 class="section-title" style="text-align:left;">Featured <em>Products</em></h2>
        </div>
        <a routerLink="/products"
           style="font-family:'Inter', sans-serif;font-size:0.75rem;letter-spacing:0.15em;text-transform:uppercase;color:#1a1410;text-decoration:none;border-bottom:1px solid #1a1410;padding-bottom:2px;display:inline-flex;align-items:center;gap:0.5rem;"
           onmouseover="this.style.color='#c9a96e';this.style.borderColor='#c9a96e'"
           onmouseout="this.style.color='#1a1410';this.style.borderColor='#1a1410'">
          View All
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>
      </div>
      <div class="products-grid">
        @for (product of products(); track product.id) {
          <app-product-card [product]="product" />
        }
      </div>
    </section>

    <!-- ══════════════════════════════════════════ HOW IT WORKS ══ -->
    <section class="hiw-section">
      <div class="hiw-eyebrow">The Process</div>
      <h2 class="hiw-title">How It <em>Works</em></h2>
      <p class="hiw-sub">From browse to doorstep in three simple steps — no account needed.</p>

      <div class="hiw-grid">

        <!-- Step 1 -->
        <div class="hiw-card">
          <div class="hiw-step-num">01</div>
          <div class="hiw-icon-wrap">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c9a96e" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
            </svg>
          </div>
          <div class="hiw-card-title">Browse &amp; Select</div>
          <div class="hiw-card-desc">Explore thousands of products across fashion, beauty, electronics &amp; more. Filter by category, price or style.</div>
          <div class="hiw-card-tag">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            No login required
          </div>
          <div class="hiw-connector"></div>
        </div>

        <!-- Step 2 -->
        <div class="hiw-card">
          <div class="hiw-step-num">02</div>
          <div class="hiw-icon-wrap">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c9a96e" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
          </div>
          <div class="hiw-card-title">Place Your Order</div>
          <div class="hiw-card-desc">Add items to cart, enter your address and phone number. Checkout takes under 60 seconds — simple and fast.</div>
          <div class="hiw-card-tag">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            Done in 60 seconds
          </div>
          <div class="hiw-connector"></div>
        </div>

        <!-- Step 3 -->
        <div class="hiw-card">
          <div class="hiw-step-num">03</div>
          <div class="hiw-icon-wrap">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c9a96e" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"/>
            </svg>
          </div>
          <div class="hiw-card-title">We Deliver</div>
          <div class="hiw-card-desc">Your order arrives at your door across Pakistan. Pay cash on delivery — no upfront payment needed.</div>
          <div class="hiw-card-tag">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            Cash on delivery
          </div>
        </div>

      </div>
    </section>

    <!-- ═════════TRUST STRIP ══ -->
    <section style="padding:4rem 2rem;max-width:1280px;margin:0 auto;">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:2rem;">
        @for (t of trust; track t.label) {
          <div style="text-align:center;padding:2rem 1rem;">
            <div style="display:flex;justify-content:center;margin-bottom:1rem;">
              <svg [attr.viewBox]="t.svg.viewBox" width="32" height="32" fill="none" stroke="#c9a96e" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path *ngFor="let d of t.svg.paths" [attr.d]="d"/>
              </svg>
            </div>
            <div style="font-family:'DM Serif Display', serif;font-size:1.1rem;font-weight:500;color:#1a1410;margin-bottom:0.375rem;">{{ t.label }}</div>
            <div style="font-family:'Inter', sans-serif;font-size:0.8rem;color:#9e9890;">{{ t.desc }}</div>
          </div>
        }
      </div>
    </section>

    <!-- ══════════════════════════════════════════ CTA BANNER ══ -->
    <div class="cta-banner">
      <div style="position:relative;max-width:700px;margin:0 auto;">
        <div class="cta-eyebrow">Limited Offer</div>
        <h2 class="cta-title">Free Delivery on<br><em>Orders Over PKR 2,000</em></h2>
        <p class="cta-sub">Cash on delivery available. No account needed. Shop everything you love.</p>
        <a routerLink="/products" class="btn-gold" style="display:inline-flex;">Shop Now</a>
      </div>
    </div>
  `
})
export class HomeComponent implements OnInit, OnDestroy {
  private productService  = inject(ProductService);
  private orderService    = inject(OrderService);
  private categoryService = inject(CategoryService);
  products = signal<Product[]>([]);
  currentSlide = signal(0);
  private slideInterval: any;

  heroSlides = signal<{id:number,category:string,name:string,img:string}[]>([]);
  categories = signal<Category[]>([]);

  // Cross layout positions
  getCardClass(i: number): string {
    const total = this.heroSlides().length;
    if (total === 0) return 'pos-hidden';
    const active = this.currentSlide();
    const diff = ((i - active) % total + total) % total;
    switch (diff) {
      case 0: return 'pos-center';
      case 1: return 'pos-top';
      case 2: return 'pos-right';
      case 3: return 'pos-bottom';
      case 4: return 'pos-left';
      default: return 'pos-hidden';
    }
  }

  goToSlide(i: number) {
    this.currentSlide.set(i);
    clearInterval(this.slideInterval);
    this.startAutoPlay();
  }

  startAutoPlay() {
    this.slideInterval = setInterval(() => {
      const total = this.heroSlides().length;
      if (total > 0) this.currentSlide.set((this.currentSlide() + 1) % total);
    }, 3500);
  }

  stats = signal([
    { num: '...', label: 'Products' },
    { num: '...', label: 'Happy Customers' },
    { num: '4.9★', label: 'Avg Rating' },
  ]);

  marqueeItems = [
    'Free Delivery over PKR 2,000', 'Cash on Delivery',
    '100% Original Products', '7-Day Easy Returns',
    'Fashion · Beauty · Electronics', 'Kitchen · Accessories · More',
    'Nationwide Delivery', 'No Account Needed',
  ];

  steps = [
    { no: 1, title: 'Browse & Select',  desc: 'Explore thousands of products across all categories. No login required.', svg: { viewBox: '0 0 24 24', paths: ['M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z'] } },
    { no: 2, title: 'Place Your Order', desc: 'Add to cart, fill in your address and phone number — done in 60 seconds.', svg: { viewBox: '0 0 24 24', paths: ['M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'] } },
    { no: 3, title: 'We Deliver',       desc: 'Your order arrives at your door. Pay cash on delivery. Simple.', svg: { viewBox: '0 0 24 24', paths: ['M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0'] } },
  ];

  trust = [
    { label: 'Free Delivery',    desc: 'On orders over PKR 2,000',   svg: { viewBox: '0 0 24 24', paths: ['M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0'] } },
    { label: 'Cash on Delivery', desc: 'Pay when you receive',        svg: { viewBox: '0 0 24 24', paths: ['M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z'] } },
    { label: '7-Day Returns',    desc: 'Hassle-free returns',         svg: { viewBox: '0 0 24 24', paths: ['M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'] } },
    { label: '100% Original',   desc: 'Certified authentic products', svg: { viewBox: '0 0 24 24', paths: ['M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z'] } },
  ];

  ngOnInit() {
    this.productService.getProducts().subscribe(p => {
      this.products.set(p.slice(0, 6));
      this.stats.update(s => s.map((st, i) =>
        i === 0 ? { ...st, num: p.length > 0 ? p.length + '+' : '0' } : st
      ));
    });

    // Load categories from DB
    this.categoryService.getCategories().subscribe(cats => {
      this.categories.set(cats);
      this.heroSlides.set(cats.slice(0, 7).map((c, i) => ({
        id: i, category: c.name, name: c.name, img: c.image
      })));
    });

    this.orderService.getOrders().subscribe({
      next: (orders) => {
        const customers = orders.length;
        this.stats.update(s => s.map((st, i) =>
          i === 1 ? { ...st, num: customers > 0 ? customers + '+' : '0' } : st
        ));
      },
      error: () => {}
    });
    this.startAutoPlay();
  }

  ngOnDestroy() { clearInterval(this.slideInterval); }
}
