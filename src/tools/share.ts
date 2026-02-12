import type { AppState } from "../map-state";
import { showFlipToast } from "../orientation";
import { closeAllDropdowns } from "../style-system";

function getShareText(state: AppState): string {
  const city = state.currentCityName;
  if (city) {
    return `I flipped ${city} upside down. \u{1F30D}\u2B07\uFE0F`;
  }
  return "I flipped the world upside down. \u{1F30D}\u2B07\uFE0F";
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
    // User cancelled or share failed — not an error worth surfacing
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
      const title = encodeURIComponent("Upside Down \u2014 You've Been Holding the Map Wrong");

      if (platform === 'native') {
        await triggerNativeShare(state);
      } else if (platform === 'linkedin') {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank', 'width=600,height=500');
      } else if (platform === 'x') {
        window.open(`https://x.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'width=600,height=400');
      } else if (platform === 'copy') {
        try {
          await navigator.clipboard.writeText(window.location.href);
          showFlipToast(state, 'Link copied');
        } catch {
          showFlipToast(state, 'Copy the URL from your browser');
        }
      }
    });
  });
}
