/* ══════════════════════════════════════════════════════════════
   Landing Page Interactions
   Non-WebGL DOM interactions: scroll reveal, card patterns,
   marble flip, idiom animation, map shield, scroll effects.
   ══════════════════════════════════════════════════════════════ */

import { initDitherGlobe } from './dither-globe';

/* ── Ink colors for card patterns ── */
const INK_COLORS: Record<string, string> = {
  teal:  '#00838A',
  blue:  '#0078BF',
  black: '#000000',
};

/* ── Card halftone patterns (canvas 2D) ── */
function drawCardPattern(canvas: HTMLCanvasElement, patternType: string, inkColor: string): void {
  const ctx = canvas.getContext('2d');
  if (!ctx || !canvas.parentElement) return;

  const w = canvas.parentElement.offsetWidth;
  const h = canvas.parentElement.offsetHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  ctx.scale(dpr, dpr);
  ctx.fillStyle = inkColor;
  ctx.strokeStyle = inkColor;

  switch (patternType) {
    case 'grid':
      for (let x = 4; x < w; x += 8)
        for (let y = 4; y < h; y += 8) {
          ctx.beginPath(); ctx.arc(x, y, 1.2, 0, Math.PI * 2); ctx.fill();
        }
      break;
    case 'stochastic': {
      const count = Math.floor(w * h * 0.002);
      for (let i = 0; i < count; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * w, Math.random() * h, 0.8 + Math.random() * 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case 'diamond':
      ctx.save(); ctx.translate(w / 2, h / 2); ctx.rotate(Math.PI / 4); ctx.translate(-w, -h);
      for (let dx = 0; dx < w * 2; dx += 7)
        for (let dy = 0; dy < h * 2; dy += 7) ctx.fillRect(dx, dy, 2, 2);
      ctx.restore();
      break;
    case 'horizontal':
      ctx.lineWidth = 0.5;
      for (let hy = 0; hy < h; hy += 4) { ctx.beginPath(); ctx.moveTo(0, hy); ctx.lineTo(w, hy); ctx.stroke(); }
      break;
    case 'reaction': {
      const centers = Array.from({ length: 15 }, () => ({
        x: Math.random() * w, y: Math.random() * h, r: 10 + Math.random() * 20,
      }));
      for (const ctr of centers)
        for (let j = 0; j < 20; j++) {
          const angle = Math.random() * Math.PI * 2;
          const dist = Math.random() * ctr.r;
          ctx.beginPath();
          ctx.arc(ctr.x + Math.cos(angle) * dist, ctr.y + Math.sin(angle) * dist, 1.5 + Math.random(), 0, Math.PI * 2);
          ctx.fill();
        }
      break;
    }
    case 'concentric': {
      const cx = w / 2, cy = h / 2;
      ctx.lineWidth = 0.5;
      for (let cr = 5; cr < Math.max(w, h); cr += 8) { ctx.beginPath(); ctx.arc(cx, cy, cr, 0, Math.PI * 2); ctx.stroke(); }
      break;
    }
  }
}

function initCardPatterns(): void {
  document.querySelectorAll('.artist-card').forEach((card) => {
    const canvas = card.querySelector('.card-pattern') as HTMLCanvasElement | null;
    const pattern = card.getAttribute('data-pattern') || 'grid';
    const inkKey = card.getAttribute('data-ink') || 'teal';
    const color = INK_COLORS[inkKey] || INK_COLORS.teal;
    if (canvas) drawCardPattern(canvas, pattern, color);
  });
}

/* ── Scroll reveal ── */
function initScrollReveal(): void {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
}

/* ── Blue Marble flip animation ── */
function initMarbleFlip(): void {
  const marble = document.querySelector('.marble-flipped') as HTMLElement | null;
  if (!marble) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { marble.classList.add('do-flip'); observer.unobserve(entry.target); }
    });
  }, { threshold: 0.3 });
  observer.observe(marble);
}

/* ── Idiom stagger animation ── */
function initIdiomAnimation(): void {
  const list = document.querySelector('.idiom-list');
  if (!list) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('li').forEach((li, i) => {
          setTimeout(() => li.classList.add('idiom-visible'), i * 150);
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  observer.observe(list);
}

/* ── Map shield ── */
function initMapShield(): void {
  const shield = document.querySelector('.map-shield') as HTMLElement | null;
  const frame = document.querySelector('.map-frame');
  if (!shield || !frame) return;
  shield.addEventListener('click', () => { shield.style.display = 'none'; });
  frame.addEventListener('mouseleave', () => { shield.style.display = ''; });
}

/* ── Scroll effects ── */
function initScrollEffects(): void {
  const arrow = document.querySelector('.marble-arrow') as HTMLElement | null;
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        if (arrow) arrow.style.transform = `rotate(${window.scrollY * 0.3}deg)`;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/* ── Orientation items stagger ── */
function initOrientationAnimation(): void {
  const list = document.querySelector('.orientation-list');
  if (!list) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.orient-item').forEach((item, i) => {
          setTimeout(() => item.classList.add('visible'), i * 200);
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  observer.observe(list);
}

/* ── Scroll progress bar ── */
function initScrollProgress(): void {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        bar.style.width = pct + '%';
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/* ══════════════════════════════════════
   INIT — all landing page systems
   ══════════════════════════════════════ */
function init(): void {
  // WebGL dither globe (async — loads geographic data)
  initDitherGlobe();

  // DOM interactions
  initCardPatterns();
  initScrollReveal();
  initMarbleFlip();
  initIdiomAnimation();
  initOrientationAnimation();
  initMapShield();
  initScrollEffects();
  initScrollProgress();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Re-render card canvases on resize
let resizeTimer: ReturnType<typeof setTimeout>;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(initCardPatterns, 250);
});
