import './app-list';
import './app-form';
import './app-detail';
import './confirmation-dialog';
import './toast-notification';
import './config-editor';
import './login-page';
import { AuthService } from '../services/auth';

export class AdminApp extends HTMLElement {
  connectedCallback() {
    this.render();
    window.addEventListener('hashchange', () => this.handleRoute());
    // No initial handleRoute call if we replace innerHTML in render based on auth
    // But if we are auth, we need to handle route.
    if (AuthService.isAuthenticated()) {
      this.handleRoute();
    }
  }

  render() {
    if (!AuthService.isAuthenticated()) {
      this.innerHTML = '<login-page></login-page>';
      return;
    }

    this.innerHTML = `
      <style>
        :host {
          display: block;
          min-height: 100vh;
        }
        header {
          background: var(--card-bg);
          padding: 1rem 2rem;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: var(--shadow);
        }
        h1 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0;
          color: var(--primary-color);
        }
        nav a, nav button {
          margin-left: 1rem;
          text-decoration: none;
          color: var(--text-color);
          font-weight: 500;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1rem;
        }
        nav a:hover, nav button:hover {
          color: var(--primary-color);
        }
        main {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }
      </style>
      <header>
        <h1>Admin Console</h1>
        <nav>
          <a href="#apps">Applications</a>
          <button id="logout-btn">Logout</button>
        </nav>
      </header>
      <main id="router-outlet"></main>
      <toast-notification id="toast"></toast-notification>
    `;

    this.querySelector('#logout-btn')?.addEventListener('click', () => {
      AuthService.logout();
    });
  }

  handleRoute() {
    const hash = window.location.hash.slice(1) || 'apps';
    const outlet = this.querySelector('#router-outlet');
    if (!outlet) return;

    // Simple router
    outlet.innerHTML = '';

    if (hash === 'apps') {
      outlet.appendChild(document.createElement('app-list'));
    } else if (hash === 'apps/create') {
      outlet.appendChild(document.createElement('app-form'));
    } else if (hash.startsWith('apps/edit/')) {
      const id = hash.split('/')[2];
      const el = document.createElement('app-form');
      el.setAttribute('app-id', id);
      outlet.appendChild(el);
    } else if (hash.startsWith('apps/')) {
      const id = hash.split('/')[1];
      const el = document.createElement('app-detail');
      el.setAttribute('app-id', id);
      outlet.appendChild(el);
    } else if (hash.startsWith('configs/create/')) {
      const appId = hash.split('/')[2];
      const el = document.createElement('config-editor');
      el.setAttribute('app-id', appId);
      outlet.appendChild(el);
    } else if (hash.startsWith('configs/edit/')) {
      const id = hash.split('/')[2];
      const el = document.createElement('config-editor');
      el.setAttribute('config-id', id);
      outlet.appendChild(el);
    } else {
      window.location.hash = 'apps';
    }
  }
}

customElements.define('admin-app', AdminApp);
