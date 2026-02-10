export interface FooterElements {
  dealBtn: HTMLElement;
  undoBtn: HTMLElement;
  dealCountEl: HTMLElement;
}

export function initFooter(container: HTMLElement): FooterElements {
  const footer = document.createElement('footer');
  footer.id = 'footer';
  footer.className = 'footer';

  footer.innerHTML = `
    <button class="footer__btn" data-action="deal">
      Deal <span class="footer__count" data-deal-count>(5)</span>
    </button>
    <button class="footer__btn" data-action="undo">Undo</button>
  `;

  container.appendChild(footer);

  return {
    dealBtn: footer.querySelector('[data-action="deal"]')!,
    undoBtn: footer.querySelector('[data-action="undo"]')!,
    dealCountEl: footer.querySelector('[data-deal-count]')!,
  };
}

export function updateDealCount(el: HTMLElement, remaining: number): void {
  el.textContent = `(${remaining})`;
}
