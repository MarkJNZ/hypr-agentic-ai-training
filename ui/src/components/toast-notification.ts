export class ToastNotification extends HTMLElement {
  private container: HTMLDivElement | null = null;

  connectedCallback() {
    // Use Light DOM or Shadow DOM? Plan says "Shadow DOM encapsulation".
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>
        .toast-container {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          z-index: 9999;
          pointer-events: none; /* Allow clicking through container */
        }
        .toast {
          pointer-events: auto;
          padding: 1rem 1.5rem;
          border-radius: 0.5rem;
          background: var(--text-color);
          color: var(--bg-color);
          box-shadow: var(--shadow-lg);
          font-size: 0.875rem;
          opacity: 0;
          transform: translateY(1rem);
          animation: slideIn 0.3s forwards ease-out;
          min-width: 300px;
        }
        .toast.success { background-color: #10b981; color: white; }
        .toast.error { background-color: #ef4444; color: white; }
        
        @keyframes slideIn {
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeOut {
          to { opacity: 0; transform: translateY(1rem); }
        }
      </style>
      <div class="toast-container"></div>
      `;
    this.container = shadow.querySelector('.toast-container');
  }

  show(message: string, type: 'success' | 'error' = 'success') {
    if (!this.container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    this.container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'fadeOut 0.3s forwards ease-in';
      toast.addEventListener('animationend', () => toast.remove());
    }, 3000);
  }
}
customElements.define('toast-notification', ToastNotification);

// Helper to find toast in DOM
export const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  const toast = document.querySelector('admin-app')?.shadowRoot?.querySelector('toast-notification') // wait admin-app doesn't use shadow root in my implementation above
    || document.querySelector('toast-notification') as any;
  if (toast && typeof toast.show === 'function') {
    toast.show(message, type);
  }
};
