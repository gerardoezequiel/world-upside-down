import type { AppState } from "../map-state";
import { setMode } from "../mode-system";
import { showFlipToast } from "../orientation";
import { closeAllPanels } from "../style-system";
import { updateShareableHash } from "../shareable-urls";

export function updateScreenprintText(name: string): void {
  const spL1 = document.getElementById('screenprint-l1');
  const spL2 = document.getElementById('screenprint-l2');
  if (!spL1 || !spL2) return;

  const words = name.toUpperCase().split(/\s+/);
  if (words.length === 1) {
    spL1.textContent = words[0];
    spL2.textContent = '';
  } else if (words.length === 2) {
    spL1.textContent = words[0];
    spL2.textContent = words[1];
  } else {
    spL1.textContent = words[0];
    spL2.textContent = words.slice(1).join(' ');
  }
}

export function setupToolTitle(state: AppState): void {
  const btn = document.getElementById('tool-title');
  const colorStripEl = document.getElementById('color-strip');
  const spL1El = document.getElementById('screenprint-l1');
  const spL2El = document.getElementById('screenprint-l2');
  if (!btn || !colorStripEl || !spL1El || !spL2El) return;
  const colorStrip: HTMLElement = colorStripEl;
  const spL1: HTMLElement = spL1El;
  const spL2: HTMLElement = spL2El;

  btn.addEventListener('click', () => {
    closeAllPanels(state);
    setMode(state, 'maker');

    spL1.setAttribute('contenteditable', 'true');
    spL2.setAttribute('contenteditable', 'true');

    const range = document.createRange();
    range.selectNodeContents(spL1);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);

    colorStrip.classList.add('visible');

    function handleL1Keydown(e: KeyboardEvent) {
      if (e.key === 'Enter') {
        e.preventDefault();
        spL2.focus();
        const r = document.createRange();
        r.selectNodeContents(spL2);
        const s = window.getSelection();
        s?.removeAllRanges();
        s?.addRange(r);
      }
    }

    function handleL2Keydown(e: KeyboardEvent) {
      if (e.key === 'Enter' || e.key === 'Escape') {
        e.preventDefault();
        confirmEdit();
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        confirmEdit();
      }
    }

    function handleClickOutside(e: MouseEvent) {
      if (!spL1.contains(e.target as Node) &&
          !spL2.contains(e.target as Node) &&
          !colorStrip.contains(e.target as Node)) {
        confirmEdit();
      }
    }

    function confirmEdit() {
      spL1.removeAttribute('contenteditable');
      spL2.removeAttribute('contenteditable');
      colorStrip.classList.remove('visible');

      spL1.removeEventListener('keydown', handleL1Keydown);
      spL2.removeEventListener('keydown', handleL2Keydown);
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('click', handleClickOutside);

      state.hasCustomTitle = true;

      sessionStorage.setItem('wud-custom-title', JSON.stringify({
        l1: spL1.textContent || '',
        l2: spL2.textContent || '',
      }));

      updateShareableHash(state);
      setMode(state, 'poster');

      const toasts = ["Your poster", "Claimed", "Now it's yours"];
      setTimeout(() => showFlipToast(state, toasts[Math.floor(Math.random() * toasts.length)]), 700);
    }

    spL1.addEventListener('keydown', handleL1Keydown);
    spL2.addEventListener('keydown', handleL2Keydown);
    document.addEventListener('keydown', handleEscape);
    setTimeout(() => document.addEventListener('click', handleClickOutside), 100);
  });
}
