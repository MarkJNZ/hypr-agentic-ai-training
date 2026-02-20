export class ThemeToggle extends HTMLElement {
    private currentTheme: string;

    constructor() {
        super();
        this.currentTheme = localStorage.getItem('theme') || 'light';
    }

    connectedCallback() {
        this.render();
        this.applyTheme();
        this.querySelector('#theme-switch')?.addEventListener('click', () => this.toggle());
    }

    private applyTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        const btn = this.querySelector('#theme-switch') as HTMLButtonElement;
        if (btn) {
            btn.setAttribute('aria-label', this.currentTheme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
            btn.innerHTML = this.currentTheme === 'dark' ? this.sunIcon() : this.moonIcon();
        }
    }

    private toggle() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', this.currentTheme);
        this.applyTheme();
    }

    private sunIcon(): string {
        return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>`;
    }

    private moonIcon(): string {
        return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>`;
    }

    render() {
        this.innerHTML = `
      <style>
        .theme-toggle-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          padding: 0;
          margin-left: 1rem;
          background: none;
          border: 1px solid var(--border-color);
          border-radius: 0.5rem;
          color: var(--text-color);
          cursor: pointer;
          transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
        }
        .theme-toggle-btn:hover {
          background: var(--bg-secondary);
          color: var(--primary-color);
        }
      </style>
      <button class="theme-toggle-btn" id="theme-switch" title="Toggle theme" aria-label="Toggle theme"></button>
    `;
    }
}

customElements.define('theme-toggle', ThemeToggle);
