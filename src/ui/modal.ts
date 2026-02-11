export function showModal(title: string, bodyHtml: string, buttons: { label: string; action: string; primary?: boolean }[]): HTMLElement {
  closeModal();

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'modal-overlay';

  const modal = document.createElement('div');
  modal.className = 'modal';

  const btnHtml = buttons
    .map(b => `<button class="modal__btn ${b.primary ? 'modal__btn--primary' : ''}" data-action="${b.action}">${b.label}</button>`)
    .join('');

  modal.innerHTML = `
    <h2 class="modal__title">${title}</h2>
    <div class="modal__body">${bodyHtml}</div>
    <div class="modal__buttons">${btnHtml}</div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Click on overlay (outside modal) closes it
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  // Prevent background scroll
  document.body.classList.add('modal-open');

  return overlay;
}

export function closeModal(): void {
  const existing = document.getElementById('modal-overlay');
  if (existing) {
    existing.remove();
    document.body.classList.remove('modal-open');
  }
}

export function showConfirm(message: string, onConfirm: () => void): void {
  const overlay = showModal('Confirm', `<p>${message}</p>`, [
    { label: 'Cancel', action: 'cancel' },
    { label: 'OK', action: 'confirm', primary: true },
  ]);

  overlay.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const action = target.dataset.action;
    if (action === 'confirm') {
      closeModal();
      onConfirm();
    } else if (action === 'cancel') {
      closeModal();
    }
  });
}
