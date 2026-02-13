import type { AppState } from "../map-state";
import { setMode, setOverlayOpacity } from "../mode-system";
import { showFlipToast } from "../orientation";
import { closeAllDropdowns } from "../style-system";
import { getFont } from "../font-system";
import { DEFAULT_STYLE_ID } from "../font-system";
import { trackEvent } from "../analytics";

const root = document.documentElement;

export function setupToolDownload(state: AppState): void {
  const btn = document.getElementById('tool-download');
  const menu = document.getElementById('download-formats');
  if (!btn || !menu) return;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = menu.classList.contains('open');
    closeAllDropdowns();
    if (!isOpen) menu.classList.add('open');
  });

  menu.querySelectorAll('.tb-dropdown-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      const format = (item as HTMLElement).dataset.format!;
      closeAllDropdowns();
      trackEvent('download', { format, city: state.currentCityName || 'unknown' });
      captureAndExport(state, format, 'download');
    });
  });

  document.addEventListener('click', () => closeAllDropdowns());
}

async function captureAndExport(state: AppState, format: string, action: 'download' | 'copy'): Promise<void> {
  const resolutions: Record<string, { w: number; h: number }> = {
    feed: { w: 1080, h: 1080 },
    reel: { w: 1080, h: 1920 },
    poster: { w: 3600, h: 4800 },
  };

  const map = state.map;
  const res = resolutions[format] || resolutions.feed;
  const exportSubtitle = document.getElementById('subtitle-text')?.textContent || '';

  showFlipToast(state, 'Generating...');

  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

  if (format === 'poster') {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const page = document.getElementById('page')!;

      const hideEls = [
        document.getElementById('reg-mark'),
        document.getElementById('toolbar'),
        document.getElementById('touch-controls'),
        document.getElementById('flip-toast'),
        document.getElementById('download-formats'),
      ];
      hideEls.forEach(el => { if (el) el.style.display = 'none'; });

      setOverlayOpacity(0.90);
      await new Promise(r => setTimeout(r, 400));

      const canvas = await html2canvas(page, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#FFFFFF',
      });

      hideEls.forEach(el => { if (el) el.style.display = ''; });

      await exportCanvas(state, canvas, format, action, exportSubtitle);
    } catch (err) {
      showFlipToast(state, 'Export failed — try Feed or Reel');
      console.error('Poster export failed:', err);
    }
  } else {
    const canvas = document.createElement('canvas');
    canvas.width = res.w;
    canvas.height = res.h;
    const ctx = canvas.getContext('2d')!;

    const mapCanvas = map.getCanvas();
    const targetRatio = res.w / res.h;
    const srcW = mapCanvas.width;
    const srcH = mapCanvas.height;
    const srcRatio = srcW / srcH;

    let cropX = 0, cropY = 0, cropW = srcW, cropH = srcH;
    if (srcRatio > targetRatio) {
      cropW = srcH * targetRatio;
      cropX = (srcW - cropW) / 2;
    } else {
      cropH = srcW / targetRatio;
      cropY = (srcH - cropH) / 2;
    }

    ctx.drawImage(mapCanvas, cropX, cropY, cropW, cropH, 0, 0, res.w, res.h);

    const spColor = getComputedStyle(root).getPropertyValue('--sp-color').trim();
    const spShadow = getComputedStyle(root).getPropertyValue('--sp-shadow').trim();
    const l1 = document.getElementById('screenprint-l1')?.textContent || '';
    const l2 = document.getElementById('screenprint-l2')?.textContent || '';

    const fontSize = res.w * 0.14;
    const heroFont = getFont(state.fontState.activeHero);
    const heroFamily = heroFont ? heroFont.family.replace(/'/g, '') : 'Anton, sans-serif';
    ctx.font = `400 ${fontSize}px ${heroFamily}`;
    ctx.textAlign = 'center';
    ctx.globalCompositeOperation = 'multiply';

    const cx = res.w / 2;
    const cy = format === 'reel' ? res.h * 0.33 : res.h / 2;

    ctx.fillStyle = spShadow;
    ctx.globalAlpha = 0.9;
    ctx.fillText(l1, cx + 5, cy - fontSize * 0.1 + 4);
    ctx.fillText(l2, cx + 5, cy + fontSize * 0.88 + 4);

    ctx.fillStyle = spColor;
    ctx.globalAlpha = 0.9;
    ctx.fillText(l1, cx, cy - fontSize * 0.1);
    ctx.fillText(l2, cx, cy + fontSize * 0.88);

    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;

    if (exportSubtitle) {
      ctx.font = `italic ${fontSize * 0.16}px 'Instrument Serif', serif`;
      ctx.fillStyle = spColor;
      ctx.globalAlpha = 0.6;
      ctx.fillText(exportSubtitle, cx, cy + fontSize * 1.6);
      ctx.globalAlpha = 1;
    }

    ctx.font = `400 ${res.w * 0.009}px 'Space Mono', monospace`;
    ctx.fillStyle = '#88898A';
    ctx.globalAlpha = 0.5;
    ctx.textAlign = 'right';
    ctx.fillText('upsidedown.earth', res.w - 20, res.h - 20);
    ctx.globalAlpha = 1;

    const toggles = document.getElementById('export-toggles');
    if (toggles) {
      const coordsOn = (toggles.querySelector('[data-toggle="coords"]') as HTMLInputElement)?.checked;
      const urlOn = (toggles.querySelector('[data-toggle="url"]') as HTMLInputElement)?.checked;

      if (coordsOn) {
        const ctr = map.getCenter();
        const coordText = `${Math.abs(ctr.lat).toFixed(2)}°${ctr.lat >= 0 ? 'N' : 'S'} / ${Math.abs(ctr.lng).toFixed(2)}°${ctr.lng >= 0 ? 'E' : 'W'}`;
        ctx.font = `400 ${res.w * 0.007}px 'Space Mono', monospace`;
        ctx.fillStyle = '#88898A';
        ctx.globalAlpha = 0.5;
        ctx.textAlign = 'left';
        ctx.fillText(coordText, 20, res.h - 20);
        ctx.globalAlpha = 1;
      }

      if (urlOn) {
        ctx.font = `400 ${res.w * 0.007}px 'Space Mono', monospace`;
        ctx.fillStyle = '#88898A';
        ctx.globalAlpha = 0.5;
        ctx.textAlign = 'center';
        ctx.fillText('upsidedown.earth', res.w / 2, res.h - 20);
        ctx.globalAlpha = 1;
      }
    }

    await exportCanvas(state, canvas, format, action, exportSubtitle);
  }

  setMode(state, 'explore');
}

async function exportCanvas(state: AppState, canvas: HTMLCanvasElement, format: string, action: 'download' | 'copy', _subtitle: string): Promise<void> {
  const citySlug = (state.currentCityName || 'world').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const styleSuffix = state.currentStyleId !== DEFAULT_STYLE_ID ? `-${state.currentStyleId}` : '';
  const filename = `upside-down-${format}-${citySlug}${styleSuffix}.png`;
  trackEvent('download', { format, action, city: state.currentCityName || 'unknown' });

  if (action === 'download') {
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();

    const toasts: Record<string, string> = {
      feed: 'Ready for the grid',
      reel: 'Swipe up on that',
      poster: 'Print it. Frame it. Flip someone\'s world.',
    };
    setTimeout(() => showFlipToast(state, toasts[format] || 'Downloaded'), 500);
  }

  if (action === 'copy') {
    try {
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob(b => resolve(b!), 'image/png');
      });
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      setTimeout(() => showFlipToast(state, 'Copied — paste it anywhere'), 500);
    } catch {
      const link = document.createElement('a');
      link.download = filename;
      link.href = canvas.toDataURL('image/png');
      link.click();
      setTimeout(() => showFlipToast(state, 'Downloaded (copy unavailable)'), 500);
    }
  }
}
