export class ConfirmationDialog extends HTMLElement {
  private dialog: HTMLDialogElement | null = null;
  private onConfirm: (() => void) | null = null;

  connectedCallback() {
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>
        dialog {
          padding: 0;
          border: none;
          max-width: 500px;
          border-radius: 0.5rem;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          background: var(--dialog-bg);
        }
        dialog::backdrop {
            background: rgba(0, 0, 0, 0.5);
        }
        .content {
          padding: 1.5rem;
        }
        .actions {
          padding: 1rem 1.5rem;
          background: var(--dialog-footer-bg);
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          border-top: 1px solid var(--border-color);
        }
        h3 { margin: 0 0 0.5rem 0; font-size: 1.125rem; font-weight: 600; color: var(--text-color); }
        p { margin: 0; color: var(--text-secondary); font-size: 0.95rem; }
        button {
          cursor: pointer;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          border: 1px solid var(--input-border);
          background: var(--card-bg);
          font-weight: 500;
          font-family: inherit;
          color: var(--text-color);
        }
        button:hover { background-color: var(--bg-secondary); }
        button.confirm {
          background: var(--danger-color);
          color: white;
          border-color: var(--danger-color);
        }
        button.confirm:hover { background: var(--danger-hover); }
      </style>
      <dialog>
        <div class="content">
          <h3 id="title">Confirm Action</h3>
          <p id="message">Are you sure?</p>
        </div>
        <div class="actions">
          <button id="cancel">Cancel</button>
          <button id="confirm" class="confirm">Delete</button>
        </div>
      </dialog>
    `;

    this.dialog = shadow.querySelector('dialog');

    shadow.getElementById('cancel')?.addEventListener('click', () => this.close());
    shadow.getElementById('confirm')?.addEventListener('click', () => {
      if (this.onConfirm) this.onConfirm();
      this.close();
    });
  }

  open(message: string, onConfirm: () => void, title = 'Confirm Action') {
    if (!this.dialog) return;
    const shadow = this.shadowRoot!;
    (shadow.getElementById('title') as HTMLElement).textContent = title;
    (shadow.getElementById('message') as HTMLElement).textContent = message;
    this.onConfirm = onConfirm;
    this.dialog.showModal();
  }

  close() {
    this.dialog?.close();
    this.onConfirm = null;
  }
}
customElements.define('confirmation-dialog', ConfirmationDialog);
