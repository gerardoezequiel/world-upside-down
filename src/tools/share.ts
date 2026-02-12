import type { AppState } from "../map-state";
import { showFlipToast } from "../orientation";
import { closeAllDropdowns } from "../style-system";

export function setupToolShare(state: AppState): void {
  const btn = document.getElementById('tool-share');
  const menu = document.getElementById('share-menu');
  if (!btn || !menu) return;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
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
      const text = encodeURIComponent("I flipped the world upside down. \u{1F30D}\u2B07\uFE0F");
      const title = encodeURIComponent("Upside Down \u2014 You've Been Holding the Map Wrong");

      if (platform === 'linkedin') {
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
