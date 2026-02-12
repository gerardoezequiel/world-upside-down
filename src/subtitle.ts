const subtitlePhrases = [
  'an exercise in unlearning north',
  'north is a decision, not a fact',
  'every map is a portrait of power',
  'the first photo of earth had south on top',
  'orientation means east, not north',
  'there is no up in space',
  'you\'ve been holding the map wrong',
  'cartography is never neutral',
  'who decided north was up?',
  'the earth doesn\'t care which way you hold it',
  'south is just north with confidence',
  'tap the title to search a place',
];

export function startSubtitleAnimation(): void {
  const subtitleEl = document.getElementById('subtitle');
  const subtitleText = document.getElementById('subtitle-text');
  if (!subtitleEl || !subtitleText) return;

  let cancelled = false;

  async function typeText(el: HTMLElement, text: string, speed = 35): Promise<void> {
    el.textContent = '';
    for (let i = 0; i < text.length; i++) {
      if (cancelled) return;
      el.textContent += text[i];
      await new Promise(r => setTimeout(r, speed));
    }
  }

  async function deleteText(el: HTMLElement, speed = 20): Promise<void> {
    const text = el.textContent || '';
    for (let i = text.length; i > 0; i--) {
      if (cancelled) return;
      el.textContent = text.substring(0, i - 1);
      await new Promise(r => setTimeout(r, speed));
    }
  }

  (async () => {
    await new Promise(r => setTimeout(r, 8000));

    let phraseIdx = 1;
    while (!cancelled) {
      subtitleEl.classList.add('typing');
      await deleteText(subtitleText);
      await new Promise(r => setTimeout(r, 400));
      if (cancelled) return;
      await typeText(subtitleText, subtitlePhrases[phraseIdx]);
      subtitleEl.classList.remove('typing');
      await new Promise(r => setTimeout(r, 6000));
      if (cancelled) return;
      phraseIdx = (phraseIdx + 1) % subtitlePhrases.length;
    }
  })();
}
