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
      height: 100vh;
      min-height: 640px;
      max-height: 900px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      align-items: stretch;
      position: relative;
      overflow: hidden;
      background: #faf7f4;
    }

    /* LEFT side — cream bg with content */
    .hero-left {
      display: flex; align-items: center;
      padding: 6rem 3rem 3rem 8rem;
      position: relative; z-index: 1;
      background: linear-gradient(to right, #faf7f4 60%, rgba(250,247,244,0.75) 85%, rgba(250,247,244,0) 100%);
    }

    /* RIGHT side — slider */
    .hero-right {
      position: relative; overflow: hidden;
    }

    /* Slider track */
    .slider-track {
      display: flex;
      width: 100%; height: 100%;
      transition: transform 0.8s cubic-bezier(0.77,0,0.18,1);
    }
    .slide-img {
      min-width: 100%; height: 100%;
      object-fit: cover; object-position: center top;
      display: block; flex-shrink: 0;
    }

    /* Slider dots */
    .slider-dots {
      position: absolute; bottom: 2rem; right: 2rem;
      display: flex; gap: 0.5rem; z-index: 5;
    }
    .slider-dot {
      width: 8px; height: 8px; border-radius: 50%;
      background: rgba(255,255,255,0.5); border: none; cursor: pointer;
      transition: all 0.3s; padding: 0;
    }
    .slider-dot.active { background: #c9a96e; width: 24px; border-radius: 99px; }

    /* Slider arrows */
    .slider-arrow {
      position: absolute; top: 50%; transform: translateY(-50%);
      width: 40px; height: 40px; border-radius: 50%;
      background: rgba(250,247,244,0.9); border: 1px solid #e8e0d6;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; z-index: 5; transition: all 0.2s;
      font-size: 1.1rem; color: #1a1410;
    }
    .slider-arrow:hover { background: #c9a96e; color: #fff; border-color: #c9a96e; }
    .slider-arrow.prev { left: 1rem; }
    .slider-arrow.next { right: 1rem; }

    /* blend left edge into cream */
    .hero-right::before {
      content: '';
      position: absolute; inset: 0; z-index: 2;
      background: linear-gradient(to right,
        rgba(250,247,244,1) 0%,
        rgba(250,247,244,0.5) 15%,
        rgba(250,247,244,0.1) 35%,
        transparent 55%
      );
      pointer-events: none;
    }

    /* decorative vertical gold line removed */
    .hero-left::after { display: none; }

    @media (max-width: 900px) {
      .hero { grid-template-columns: 1fr; min-height: 100svh; }
      .hero-right { position: absolute; inset: 0; z-index: 0; }
      .hero-right::before { background: linear-gradient(to bottom, rgba(250,247,244,0.85) 0%, rgba(250,247,244,0.7) 100%); }
      .hero-left { background: transparent; padding: 9rem 1.5rem 3rem; z-index: 1; }
      .hero-left::after { display: none; }
    }
    @media (max-width: 480px) {
      .hero-left { padding: 7rem 1.25rem 2.5rem; }
      .hero-btns { flex-direction: column; width: 100%; }
      .hero-btns a { width: 100%; text-align: center; justify-content: center; }
      .hero-stats { flex-wrap: wrap; gap: 1rem; }
      .stat-item { padding-right: 1.25rem; margin-right: 1.25rem; border-right: 1px solid #e8e0d6; }
      .slider-arrow { display: none; }
    }

    /* ── Text content ── */
    .hero-content {
      display: flex; flex-direction: column; align-items: flex-start;
    }

    .hero-eyebrow {
      font-family: 'Inter', sans-serif;
      font-size: 0.68rem; font-weight: 600;
      letter-spacing: 0.32em; text-transform: uppercase;
      color: #c9a96e; margin-bottom: 1.25rem;
      display: flex; align-items: center; gap: 0.75rem;
    }
    .hero-eyebrow::before { content: ''; width: 28px; height: 1px; background: #c9a96e; }

    .hero-title {
      font-family: 'DM Serif Display', Georgia, serif;
      font-size: clamp(2.8rem, 4vw, 5rem);
      font-weight: 400; line-height: 1.02;
      color: #1a1410; margin-bottom: 1.5rem;
      letter-spacing: -0.01em;
    }
    .hero-title em {
      font-style: italic;
      background: linear-gradient(135deg, #b8920a, #c9a96e, #8b6914);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }

    .hero-desc {
      font-family: 'Inter', sans-serif;
      font-size: 0.95rem; color: #6b6560;
      line-height: 1.8; max-width: 380px; margin-bottom: 2.5rem;
    }

    .hero-btns { display: flex; gap: 0.875rem; flex-wrap: wrap; margin-bottom: 3rem; }

    .hero-stats {
      display: flex; gap: 0;
      padding-top: 1.75rem;
      width: 100%;
    }
    .stat-item {
      display: flex; flex-direction: column;
      padding-right: 2.25rem; margin-right: 2.25rem;
      border-right: 1px solid #e8e0d6;
    }
    .stat-item:last-child { border-right: none; padding-right: 0; margin-right: 0; }
    .stat-num {
      font-family: 'DM Serif Display', serif;
      font-size: 2rem; font-weight: 400; line-height: 1;
      background: linear-gradient(135deg, #c9a96e, #8b6914);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }
    .stat-label {
      font-family: 'Inter', sans-serif; font-size: 0.58rem;
      letter-spacing: 0.2em; text-transform: uppercase; color: #9e9890; margin-top: 0.4rem;
    }

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

    /* ── Category grid — modern tall cards ── */
    .cat-grid {
      display: grid; grid-template-columns: repeat(6,1fr); gap: 1rem;
    }
    @media (max-width: 1100px) { .cat-grid { grid-template-columns: repeat(3,1fr); gap: 0.875rem; } }
    @media (max-width: 600px)  { .cat-grid { grid-template-columns: repeat(2,1fr); gap: 0.75rem; } }

    .cat-card {
      position: relative; display: flex; flex-direction: column;
      align-items: center; justify-content: flex-end;
      aspect-ratio: 3/4; border-radius: 20px; overflow: hidden;
      text-decoration: none; cursor: pointer;
      box-shadow: 0 4px 20px rgba(26,20,16,0.1);
      transition: transform 0.35s ease, box-shadow 0.35s ease;
    }
    .cat-card:hover { transform: translateY(-6px); box-shadow: 0 16px 48px rgba(26,20,16,0.18); }
    .cat-card img {
      position: absolute; inset: 0; width: 100%; height: 100%;
      object-fit: cover; object-position: top;
      transition: transform 0.6s ease;
    }
    .cat-card:hover img { transform: scale(1.07); }
    .cat-card::after {
      content: ''; position: absolute; inset: 0;
      background: linear-gradient(to top, rgba(26,20,16,0.72) 0%, rgba(26,20,16,0.2) 50%, transparent 75%);
    }
    .cat-card-label {
      position: relative; z-index: 2; padding: 1rem 0.875rem;
      text-align: center; width: 100%;
    }
    .cat-card-name {
      font-family: 'DM Serif Display', serif; font-size: 1.05rem;
      color: #fff; font-weight: 400; line-height: 1.2; display: block;
    }
    .cat-card-count {
      font-family: 'Inter', sans-serif; font-size: 0.62rem;
      color: rgba(255,255,255,0.65); letter-spacing: 0.1em;
      text-transform: uppercase; display: block; margin-top: 0.2rem;
    }
    @media (max-width: 480px) { .cat-card-name { font-size: 0.9rem; } }

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
    .products-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 1.5rem; }
    @media (max-width: 1100px) { .products-grid { grid-template-columns: repeat(3,1fr); } }
    @media (max-width: 900px) { .products-grid { grid-template-columns: repeat(2,1fr); gap: 1rem; } }
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

    /* ── Trust strip ── */
    .trust-strip {
      background: #1a1410; padding: 3rem 2rem;
    }
    .trust-grid {
      display: grid; grid-template-columns: repeat(4,1fr);
      max-width: 1280px; margin: 0 auto; gap: 0;
    }
    @media (max-width: 900px) { .trust-grid { grid-template-columns: repeat(2,1fr); } }
    @media (max-width: 480px) { .trust-grid { grid-template-columns: repeat(2,1fr); gap: 0; } }
    .trust-item {
      display: flex; flex-direction: column; align-items: center;
      padding: 1.5rem 1rem; text-align: center;
      border-right: 1px solid rgba(255,255,255,0.06);
    }
    .trust-item:last-child { border-right: none; }
    @media (max-width: 900px) {
      .trust-item:nth-child(2) { border-right: none; }
      .trust-item:nth-child(3) { border-right: 1px solid rgba(255,255,255,0.06); }
      .trust-item { border-bottom: 1px solid rgba(255,255,255,0.06); }
      .trust-item:nth-child(3), .trust-item:nth-child(4) { border-bottom: none; }
    }
    .trust-icon {
      width: 44px; height: 44px; border-radius: 12px;
      background: rgba(201,169,110,0.1); border: 1px solid rgba(201,169,110,0.2);
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 0.875rem;
    }
    .trust-label { font-family: 'DM Serif Display', serif; font-size: 1rem; color: #faf7f4; margin-bottom: 0.25rem; }
    .trust-desc  { font-family: 'Inter', sans-serif; font-size: 0.75rem; color: #6b6560; line-height: 1.5; }

    /* ── Flash deals band ── */
    .flash-band {
      background: linear-gradient(135deg, #1a1410 0%, #2d2520 100%);
      padding: 0.625rem 1.5rem;
      display: flex; align-items: center; justify-content: center; gap: 1.5rem;
      flex-wrap: wrap;
    }
    .flash-badge {
      background: linear-gradient(135deg, #c9a96e, #8b6914);
      color: #fff; font-family: 'Inter', sans-serif;
      font-size: 0.6rem; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase;
      padding: 0.25rem 0.625rem; border-radius: 99px;
    }
    .flash-text {
      font-family: 'Inter', sans-serif; font-size: 0.8rem;
      color: rgba(255,255,255,0.85); letter-spacing: 0.05em;
    }
    .flash-text strong { color: #c9a96e; }

    /* ── Testimonials ── */
    .testi-grid {
      display: grid; grid-template-columns: repeat(3,1fr); gap: 1.5rem;
      max-width: 1280px; margin: 0 auto;
    }
    @media (max-width: 900px) { .testi-grid { grid-template-columns: 1fr; gap: 1rem; } }
    .testi-card {
      background: #fff; border: 1px solid #e8e0d6; border-radius: 16px;
      padding: 1.75rem; display: flex; flex-direction: column; gap: 1rem;
      transition: box-shadow 0.25s;
    }
    .testi-card:hover { box-shadow: 0 8px 32px rgba(26,20,16,0.08); }
    .testi-stars { display: flex; gap: 3px; }
    .testi-text  { font-family: 'Inter', sans-serif; font-size: 0.875rem; color: #6b6560; line-height: 1.75; flex: 1; }
    .testi-author { display: flex; align-items: center; gap: 0.75rem; }
    .testi-avatar {
      width: 40px; height: 40px; border-radius: 50%;
      background: linear-gradient(135deg, #c9a96e, #8b6914);
      display: flex; align-items: center; justify-content: center;
      font-family: 'DM Serif Display', serif; font-size: 1rem; color: #fff;
      flex-shrink: 0;
    }
    .testi-name  { font-family: 'DM Serif Display', serif; font-size: 0.95rem; color: #1a1410; }
    .testi-city  { font-family: 'Inter', sans-serif; font-size: 0.72rem; color: #9e9890; }

    /* ── Instagram-style highlight strip ── */
    .highlight-strip {
      display: grid; grid-template-columns: repeat(4,1fr); gap: 0;
      max-height: 420px; overflow: hidden;
    }
    @media (max-width: 768px) { .highlight-strip { grid-template-columns: repeat(2,1fr); max-height: 340px; } }
    .highlight-item {
      position: relative; overflow: hidden; aspect-ratio: 1/1;
    }
    .highlight-item img {
      width: 100%; height: 100%; object-fit: cover;
      transition: transform 0.6s ease;
    }
    .highlight-item:hover img { transform: scale(1.08); }
    .highlight-item::after {
      content: ''; position: absolute; inset: 0;
      background: rgba(26,20,16,0); transition: background 0.3s;
    }
    .highlight-item:hover::after { background: rgba(26,20,16,0.25); }
    .cta-banner::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, #c9a96e, transparent); pointer-events: none; }
    .cta-title { font-family: 'DM Serif Display', serif; font-size: clamp(2.5rem, 5vw, 4rem); font-weight: 300; color: #1a1410; line-height: 1.15; margin-bottom: 1.25rem; letter-spacing: 0.02em; }
    .cta-title em { font-style: italic; background: linear-gradient(135deg, #c9a96e, #8b6914); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .cta-sub { font-family: 'Inter', sans-serif; font-size: 0.85rem; letter-spacing: 0.1em; color: #6b6560; margin-bottom: 2.5rem; max-width: 400px; margin-left: auto; margin-right: auto; }
    .cta-eyebrow { font-family: 'Inter', sans-serif; font-size: 0.65rem; font-weight: 500; letter-spacing: 0.3em; text-transform: uppercase; color: #c9a96e; margin-bottom: 1.25rem; display: flex; align-items: center; justify-content: center; gap: 0.75rem; }
    .cta-eyebrow::before, .cta-eyebrow::after { content: ''; width: 40px; height: 1px; background: rgba(201,169,110,0.5); }

    /* ── CTA banner ─── */
    .cta-banner { background: rgba(250,247,244,0.96); padding: 5rem 2rem; text-align: center; position: relative; overflow: hidden; border-top: 1px solid #e8e0d6; }
    @media (max-width: 768px) {
      .hiw-section { padding: 4rem 1.25rem; }
      .hiw-card { padding: 2rem 1.5rem; }
      .cta-banner { padding: 3rem 1.25rem; }
      .section-header { margin-bottom: 2rem; }
      .view-more-wrap { margin-top: 1.75rem; }
      .cat-grid { gap: 0.875rem; }
    }
    @media (max-width: 480px) {
      .cat-grid { grid-template-columns: 1fr; }
      .products-grid { grid-template-columns: repeat(2,1fr); gap: 0.75rem; }
      .view-more-btn { width: 100%; justify-content: center; }
    }

    /* Local button overrides for home */
    .hero-btns .btn-primary {
      display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
      padding: 0.875rem 2.5rem;
      background: #1a1410;
      color: #faf7f4;
      font-family: 'Inter', sans-serif; font-weight: 500; font-size: 0.8125rem;
      letter-spacing: 0.12em; text-transform: uppercase;
      border: 1px solid #1a1410; cursor: pointer;
      transition: all 0.3s ease; border-radius: 2px;
      text-decoration: none;
    }
    .hero-btns .btn-primary:hover {
      background: #2d2520; border-color: #2d2520;
      box-shadow: 0 8px 24px rgba(0,0,0,0.3);
      transform: translateY(-1px);
    }

    .btn-gold {
      display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
      padding: 0.875rem 2.5rem;
      background: linear-gradient(135deg, #c9a96e, #8b6914);
      color: #fff; border: none;
      font-family: 'Inter', sans-serif; font-size: 0.82rem; font-weight: 600;
      letter-spacing: 0.1em; text-transform: uppercase;
      text-decoration: none; cursor: pointer;
      transition: all 0.3s ease; border-radius: 2px;
      box-shadow: 0 4px 20px rgba(201,169,110,0.4);
    }
    .btn-gold:hover { filter: brightness(1.1); box-shadow: 0 6px 28px rgba(201,169,110,0.5); }
  `],
  template: `

    <!-- ══════════════════════════════════════════════ HERO ══ -->
    <section class="hero">

      <!-- Left: Content -->
      <div class="hero-left">
        <div class="hero-content">
          <h1 class="hero-title">
            Pakistan's<br><em>Favourite</em><br>Online Store
          </h1>
          <p class="hero-desc">
            Fashion, beauty, accessories &amp; more — delivered to your doorstep with cash on delivery. No account needed.
          </p>
          <div class="hero-btns">
            <a routerLink="/products" class="btn-primary">Shop Now</a>
            <a href="#categories" class="btn-primary" style="background:transparent;color:#1a1410;border:1px solid #1a1410;">Explore Categories</a>
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
      </div>

      <!-- Right: Image Slider -->
      <div class="hero-right">
        <div class="slider-track" [style.transform]="'translateX(-' + activeSlide() * 100 + '%)'">
          @for (s of slides; track s.img) {
            <img class="slide-img" [src]="s.img" [alt]="s.alt" />
          }
        </div>
        <!-- Dots -->
        <div class="slider-dots">
          @for (s of slides; track $index; let i = $index) {
            <button class="slider-dot" [class.active]="activeSlide() === i" (click)="goSlide(i)"></button>
          }
        </div>
        <!-- Arrows -->
        <button class="slider-arrow prev" (click)="prevSlide()">‹</button>
        <button class="slider-arrow next" (click)="nextSlide()">›</button>
      </div>

    </section>

    <!-- ══════════════════════════════════════════ FLASH BAND ══ -->
    <div class="flash-band">
      <span class="flash-badge">🔥 Hot Deals</span>
      <span class="flash-text">Free delivery on orders <strong>over PKR 2,000</strong></span>
      <span style="color:rgba(255,255,255,0.2);font-size:0.75rem;">|</span>
      <span class="flash-text">Cash on Delivery — <strong>No advance payment</strong></span>
      <span style="color:rgba(255,255,255,0.2);font-size:0.75rem;">|</span>
      <span class="flash-text">7-Day <strong>Easy Returns</strong></span>
    </div>

    <!-- ══════════════════════════════════════════ CATEGORIES ══ -->
    <section id="categories" style="padding:5rem 1.5rem 4rem;max-width:1280px;margin:0 auto;">
      <div class="section-header">
        <div class="section-eyebrow">Explore</div>
        <h2 class="section-title">Shop by <em>Category</em></h2>
        <p style="font-family:'Inter',sans-serif;font-size:0.875rem;color:#9e9890;margin-top:0.75rem;">From fashion to beauty — everything delivered to your door</p>
      </div>

      <div class="cat-grid">
        <a routerLink="/products" [queryParams]="{category:'Clothing'}" class="cat-card">
          <img src="https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=600&q=85&fit=crop&crop=top" alt="Women's Fashion" loading="lazy"/>
          <div class="cat-card-label">
            <span class="cat-card-name">Women</span>
            <span class="cat-card-count">Fashion & Style</span>
          </div>
        </a>
        <a routerLink="/products" [queryParams]="{category:'Clothing'}" class="cat-card">
          <img src="https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&q=85&fit=crop&crop=top" alt="Men's Fashion" loading="lazy"/>
          <div class="cat-card-label">
            <span class="cat-card-name">Men</span>
            <span class="cat-card-count">Clothing & Wear</span>
          </div>
        </a>
        <a routerLink="/products" [queryParams]="{category:'Beauty'}" class="cat-card">
          <img src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=85&fit=crop&crop=top" alt="Beauty" loading="lazy"/>
          <div class="cat-card-label">
            <span class="cat-card-name">Beauty</span>
            <span class="cat-card-count">Skincare & Makeup</span>
          </div>
        </a>
        <a routerLink="/products" [queryParams]="{category:'Footwear'}" class="cat-card">
          <img src="https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&q=85&fit=crop&crop=top" alt="Footwear" loading="lazy"/>
          <div class="cat-card-label">
            <span class="cat-card-name">Footwear</span>
            <span class="cat-card-count">Shoes & Sandals</span>
          </div>
        </a>
        <a routerLink="/products" [queryParams]="{category:'Accessories'}" class="cat-card">
          <img src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=85&fit=crop" alt="Bags" loading="lazy"/>
          <div class="cat-card-label">
            <span class="cat-card-name">Handbags</span>
            <span class="cat-card-count">Bags & Wallets</span>
          </div>
        </a>
        <a routerLink="/products" class="cat-card" style="background:#1a1410;">
          <div style="position:absolute;inset:0;background:linear-gradient(135deg,#1a1410,#2d2520);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0.75rem;z-index:1;">
            <div style="font-family:'DM Serif Display',serif;font-size:2rem;font-weight:400;color:#c9a96e;line-height:1;">All</div>
            <div style="font-family:'Inter',sans-serif;font-size:0.65rem;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.5);">Categories →</div>
          </div>
        </a>
      </div>

      <!-- View All -->
      <div class="view-more-wrap">
        <a routerLink="/products" class="view-more-btn">
          Browse All Products
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>
      </div>
    </section>

    <!-- ══════════════════════════════════════════ PRODUCTS ══ -->
    <section style="padding:5rem 1.5rem 4rem;max-width:1280px;margin:0 auto;">
      <div style="display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:3rem;flex-wrap:wrap;gap:1rem;">
        <div>
          <div class="section-eyebrow" style="text-align:left;">Hand-Picked For You</div>
          <h2 class="section-title" style="text-align:left;">Trending <em>Right Now</em></h2>
        </div>
        <a routerLink="/products" style="font-family:'Inter',sans-serif;font-size:0.75rem;letter-spacing:0.15em;text-transform:uppercase;color:#1a1410;text-decoration:none;display:inline-flex;align-items:center;gap:0.5rem;padding:0.5rem 1.25rem;border:1px solid #1a1410;transition:all 0.2s;"
           onmouseover="this.style.background='#1a1410';this.style.color='#faf7f4'"
           onmouseout="this.style.background='transparent';this.style.color='#1a1410'">
          View All
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
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

    <!-- ══════════════════════════════════════════ TRUST STRIP ══ -->
    <div class="trust-strip">
      <div class="trust-grid">
        <div class="trust-item">
          <div class="trust-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c9a96e" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"/></svg>
          </div>
          <div class="trust-label">Free Delivery</div>
          <div class="trust-desc">On all orders over PKR 2,000 nationwide</div>
        </div>
        <div class="trust-item">
          <div class="trust-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c9a96e" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
          </div>
          <div class="trust-label">Cash on Delivery</div>
          <div class="trust-desc">Pay only when your order arrives</div>
        </div>
        <div class="trust-item">
          <div class="trust-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c9a96e" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
          </div>
          <div class="trust-label">7-Day Returns</div>
          <div class="trust-desc">Easy hassle-free return policy</div>
        </div>
        <div class="trust-item">
          <div class="trust-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c9a96e" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
          </div>
          <div class="trust-label">100% Original</div>
          <div class="trust-desc">Certified authentic products only</div>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════════════ TESTIMONIALS ══ -->
    <section style="padding:5rem 1.5rem;background:#faf7f4;">
      <div style="max-width:1280px;margin:0 auto;">
        <div class="section-header">
          <div class="section-eyebrow">Happy Customers</div>
          <h2 class="section-title">What They're <em>Saying</em></h2>
        </div>
        <div class="testi-grid">
          <div class="testi-card">
            <div class="testi-stars">
              @for (s of [1,2,3,4,5]; track s) {
                <svg width="14" height="14" viewBox="0 0 20 20" fill="#c9a96e"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
              }
            </div>
            <p class="testi-text">"Ordered a dress for my sister's wedding — delivered in 2 days in Lahore! Quality was excellent and cash on delivery made it so easy. Will definitely order again."</p>
            <div class="testi-author">
              <div class="testi-avatar">F</div>
              <div>
                <div class="testi-name">Fatima K.</div>
                <div class="testi-city">Lahore, Punjab</div>
              </div>
            </div>
          </div>
          <div class="testi-card">
            <div class="testi-stars">
              @for (s of [1,2,3,4,5]; track s) {
                <svg width="14" height="14" viewBox="0 0 20 20" fill="#c9a96e"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
              }
            </div>
            <p class="testi-text">"Amazing skincare products at such great prices! The packaging was perfect and delivery was super fast to Karachi. The beauty products are 100% original — very happy!"</p>
            <div class="testi-author">
              <div class="testi-avatar">S</div>
              <div>
                <div class="testi-name">Sara A.</div>
                <div class="testi-city">Karachi, Sindh</div>
              </div>
            </div>
          </div>
          <div class="testi-card">
            <div class="testi-stars">
              @for (s of [1,2,3,4,5]; track s) {
                <svg width="14" height="14" viewBox="0 0 20 20" fill="#c9a96e"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
              }
            </div>
            <p class="testi-text">"Been ordering from Shopzee for 3 months now. Great variety, prices are unbeatable and the COD option is a lifesaver. My whole family shops here now!"</p>
            <div class="testi-author">
              <div class="testi-avatar">Z</div>
              <div>
                <div class="testi-name">Zara M.</div>
                <div class="testi-city">Islamabad, ICT</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ══════════════════════════════════════════ PHOTO GRID ══ -->
    <div class="highlight-strip">
      <div class="highlight-item">
        <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=85&fit=crop" alt="Fashion" loading="lazy"/>
      </div>
      <div class="highlight-item">
        <img src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=85&fit=crop" alt="Beauty" loading="lazy"/>
      </div>
      <div class="highlight-item">
        <img src="https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=85&fit=crop" alt="Footwear" loading="lazy"/>
      </div>
      <div class="highlight-item">
        <img src="https://images.unsplash.com/photo-1523779917675-b6ed3a42a561?w=800&q=85&fit=crop" alt="Accessories" loading="lazy"/>
      </div>
    </div>

    <!-- ══════════════════════════════════════════ CTA BANNER ══ -->
    <div style="background:#1a1410;padding:5rem 2rem;text-align:center;position:relative;overflow:hidden;">
      <div style="position:absolute;top:-4rem;left:50%;transform:translateX(-50%);width:40rem;height:40rem;background:radial-gradient(circle,rgba(201,169,110,0.12) 0%,transparent 70%);pointer-events:none;"></div>
      <div style="position:relative;max-width:700px;margin:0 auto;">
        <div class="cta-eyebrow" style="color:#c9a96e;">✨ Limited Offer</div>
        <h2 style="font-family:'DM Serif Display',serif;font-size:clamp(2.5rem,5vw,4rem);font-weight:300;color:#faf7f4;line-height:1.15;margin-bottom:1.25rem;">Free Delivery on<br><em style="font-style:italic;background:linear-gradient(135deg,#c9a96e,#8b6914);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">Orders Over PKR 2,000</em></h2>
        <p style="font-family:'Inter',sans-serif;font-size:0.875rem;color:rgba(255,255,255,0.5);margin-bottom:2.5rem;max-width:400px;margin-left:auto;margin-right:auto;letter-spacing:0.05em;">Cash on delivery • No account needed • Delivered across Pakistan</p>
        <a routerLink="/products" class="btn-gold" style="display:inline-flex;">Shop Now →</a>
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

  // ── Hero image slider ────────────────────────────────────
  activeSlide = signal(0);
  private sliderTimer: any;

  slides = [
    { img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&q=90&fit=crop&crop=top', alt: 'Women Fashion' },
    { img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200&q=90&fit=crop&crop=top', alt: 'Cosmetics' },
    { img: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1200&q=90&fit=crop', alt: 'Handbags' },
    { img: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=1200&q=90&fit=crop', alt: 'Women Shoes' },
  ];

  goSlide(i: number) {
    this.activeSlide.set(i);
    clearInterval(this.sliderTimer);
    this.startSlider();
  }
  nextSlide() { this.goSlide((this.activeSlide() + 1) % this.slides.length); }
  prevSlide() { this.goSlide((this.activeSlide() - 1 + this.slides.length) % this.slides.length); }
  startSlider() {
    this.sliderTimer = setInterval(() => {
      this.activeSlide.set((this.activeSlide() + 1) % this.slides.length);
    }, 4000);
  }

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
    this.startSlider();
    this.productService.getProducts().subscribe(p => {
      this.products.set(p.slice(0, 8));
      this.stats.update(s => s.map((st, i) =>
        i === 0 ? { ...st, num: p.length > 0 ? p.length + '+' : '0' } : st
      ));
    });

    const hiddenCats = ['Electronics', 'Kitchen', 'Sports', 'Home Decor', 'Bedsheets', 'Kids & Toys', 'Daily Gadgets', 'Stationery'];

    // Load categories from DB
    this.categoryService.getCategories().subscribe(cats => {
      const filtered = cats.filter(c => !hiddenCats.includes(c.name));
      this.categories.set(filtered);
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

  ngOnDestroy() { clearInterval(this.slideInterval); clearInterval(this.sliderTimer); }
}
