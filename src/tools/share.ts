import type { AppState } from "../map-state";
import { showFlipToast } from "../orientation";
import { closeAllDropdowns } from "../style-system";
import { trackEvent } from "../analytics";
import { getFont } from "../font-system";

const root = document.documentElement;

const shareTemplates = [
  "I flipped {city} upside down. Turns out NASA did it first.",
  "{city} looks completely different south-up. Try it.",
  "You've been looking at {city} wrong your whole life.",
  "I broke {city}. Or maybe the map was already broken.",
  "The world upside down, starting with {city}.",
  "Lost in {city} \u2014 on purpose. upsidedown.earth",
  "{city} upside down hits different.",
  "I just rotated {city} 180\u00b0. Your atlas lied.",
  "South-up {city}. You're welcome.",
  "{city} but make it disorienting \ud83c\udf0d",
];

function getShareText(state: AppState): string {
  const city = state.currentCityName;
  if (city) {
    const template = shareTemplates[Math.floor(Math.random() * shareTemplates.length)];
    return template.replace('{city}', city);
  }
  return "I flipped the world upside down. Turns out NASA did it first.";
}

async function captureMapImage(state: AppState): Promise<Blob> {
  const mapCanvas = state.map.getCanvas();
  const size = 1080;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Center-crop the map canvas to a square
  const srcW = mapCanvas.width;
  const srcH = mapCanvas.height;
  const cropSide = Math.min(srcW, srcH);
  const cropX = (srcW - cropSide) / 2;
  const cropY = (srcH - cropSide) / 2;
  ctx.drawImage(mapCanvas, cropX, cropY, cropSide, cropSide, 0, 0, size, size);

  // Overlay the screenprint title
  const spColor = getComputedStyle(root).getPropertyValue('--sp-color').trim();
  const spShadow = getComputedStyle(root).getPropertyValue('--sp-shadow').trim();
  const l1 = document.getElementById('screenprint-l1')?.textContent || '';
  const l2 = document.getElementById('screenprint-l2')?.textContent || '';

  const fontSize = size * 0.12;
  const heroFont = getFont(state.fontState.activeHero);
  const heroFamily = heroFont ? heroFont.family.replace(/'/g, '') : 'Anton, sans-serif';
  ctx.font = `400 ${fontSize}px ${heroFamily}`;
  ctx.textAlign = 'center';
  ctx.globalCompositeOperation = 'multiply';

  const cx = size / 2;
  const cy = size / 2;

  ctx.fillStyle = spShadow;
  ctx.globalAlpha = 0.9;
  ctx.fillText(l1, cx + 4, cy - fontSize * 0.1 + 3);
  ctx.fillText(l2, cx + 4, cy + fontSize * 0.88 + 3);

  ctx.fillStyle = spColor;
  ctx.globalAlpha = 0.9;
  ctx.fillText(l1, cx, cy - fontSize * 0.1);
  ctx.fillText(l2, cx, cy + fontSize * 0.88);

  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;

  // Watermark
  ctx.font = `400 ${size * 0.009}px 'Space Mono', monospace`;
  ctx.fillStyle = '#88898A';
  ctx.globalAlpha = 0.5;
  ctx.textAlign = 'right';
  ctx.fillText('upsidedown.earth', size - 16, size - 16);
  ctx.globalAlpha = 1;

  return new Promise<Blob>((resolve) => {
    canvas.toBlob(b => resolve(b!), 'image/png');
  });
}

async function shareAsImage(state: AppState): Promise<void> {
  showFlipToast(state, 'Preparing image...');
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

  try {
    const blob = await captureMapImage(state);
    const citySlug = (state.currentCityName || 'world').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const file = new File([blob], `upside-down-${citySlug}.png`, { type: 'image/png' });

    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: "Upside Down",
        text: getShareText(state),
      });
      trackEvent('share', { platform: 'image-native', city: state.currentCityName || 'unknown' });
      showFlipToast(state, 'Shared. The disorientation spreads.');
    } else {
      // Fallback: download the image
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `upside-down-${citySlug}.png`;
      a.click();
      URL.revokeObjectURL(url);
      showFlipToast(state, 'Image downloaded \u2014 share it anywhere');
      trackEvent('share', { platform: 'image-download', city: state.currentCityName || 'unknown' });
    }
  } catch (e) {
    if (e instanceof Error && e.name !== 'AbortError') {
      showFlipToast(state, 'Could not share image');
    }
  }
}

async function triggerNativeShare(state: AppState): Promise<boolean> {
  if (!navigator.share) return false;
  try {
    await navigator.share({
      title: "Upside Down \u2014 You've Been Holding the Map Wrong",
      text: getShareText(state),
      url: window.location.href,
    });
    return true;
  } catch (e) {
    if (e instanceof Error && e.name !== 'AbortError') {
      return false;
    }
    return true; // AbortError = user cancelled, still counts as "handled"
  }
}

export function setupToolShare(state: AppState): void {
  const btn = document.getElementById('tool-share');
  const menu = document.getElementById('share-menu');
  const nativeItem = document.getElementById('share-native');
  if (!btn || !menu) return;

  // Hide native share option if API unavailable
  if (!navigator.share && nativeItem) {
    nativeItem.style.display = 'none';
  }

  // Hide share-as-image if Web Share Files API is unavailable
  const imageItem = document.getElementById('share-image');
  if (imageItem) {
    try {
      const testFile = new File([''], 'test.png', { type: 'image/png' });
      if (!navigator.canShare?.({ files: [testFile] })) {
        imageItem.style.display = 'none';
      }
    } catch {
      if (imageItem) imageItem.style.display = 'none';
    }
  }

  btn.addEventListener('click', async (e) => {
    e.stopPropagation();

    // On mobile with native share: skip dropdown, share directly
    if ('share' in navigator && window.matchMedia('(max-width: 768px)').matches) {
      closeAllDropdowns();
      await triggerNativeShare(state);
      return;
    }

    const isOpen = menu.classList.contains('open');
    closeAllDropdowns();
    if (!isOpen) menu.classList.add('open');
  });

  menu.querySelectorAll('.tb-dropdown-item').forEach(item => {
    item.addEventListener('click', async (e) => {
      e.stopPropagation();
      closeAllDropdowns();

      const platform = (item as HTMLElement).dataset.share;
      const url = encodeURIComponent(window.location.href);
      const text = encodeURIComponent(getShareText(state));

      trackEvent('share', { platform: platform || 'unknown', city: state.currentCityName || 'unknown' });

      if (platform === 'native') {
        await triggerNativeShare(state);
      } else if (platform === 'image') {
        await shareAsImage(state);
      } else if (platform === 'linkedin') {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank', 'width=600,height=500');
      } else if (platform === 'x') {
        window.open(`https://x.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'width=600,height=400');
      } else if (platform === 'whatsapp') {
        window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
      } else if (platform === 'instagram') {
        // Instagram doesn't support URL sharing — generate image and trigger share/download
        await shareAsImage(state);
      } else if (platform === 'copy') {
        const copyToasts = [
          'Link copied. Go spread the disorientation.',
          'Copied. Now paste it somewhere dangerous.',
          'Link in clipboard. Use wisely.',
          'Copied. The world will thank you.',
        ];
        try {
          await navigator.clipboard.writeText(window.location.href);
          showFlipToast(state, copyToasts[Math.floor(Math.random() * copyToasts.length)]);
        } catch {
          showFlipToast(state, 'Copy the URL from your browser');
        }
      }
    });
  });
}
