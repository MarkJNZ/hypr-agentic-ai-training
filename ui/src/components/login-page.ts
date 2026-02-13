import { AuthService } from '../services/auth';

export class LoginPage extends HTMLElement {
  connectedCallback() {
    this.render();
    this.addEventListeners();
  }

  render() {
    this.innerHTML = `
      <style>
        .login-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          width: 100%;
          background: linear-gradient(135deg, #0d1117 0%, #161b22 50%, #0d1117 100%);
        }
        .login-card {
          background: #161b22;
          padding: 2.5rem;
          border-radius: 12px;
          border: 1px solid #30363d;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
          width: 100%;
          max-width: 420px;
          text-align: center;
        }
        .login-card h2 {
          color: #f0f6fc;
          margin-bottom: 0.5rem;
          font-size: 1.5rem;
          font-weight: 600;
        }
        .login-card p {
          color: #8b949e;
          margin-bottom: 2rem;
          font-size: 0.9rem;
        }
        .github-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          width: 100%;
          padding: 0.85rem 1.5rem;
          background: #238636;
          color: #ffffff;
          border: none;
          border-radius: 6px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s ease, transform 0.1s ease, box-shadow 0.2s ease;
          box-shadow: 0 2px 8px rgba(35, 134, 54, 0.3);
        }
        .github-btn:hover {
          background: #2ea043;
          box-shadow: 0 4px 16px rgba(35, 134, 54, 0.4);
          transform: translateY(-1px);
        }
        .github-btn:active {
          transform: translateY(0);
        }
        .github-btn svg {
          width: 22px;
          height: 22px;
          fill: #ffffff;
        }
        .divider {
          display: flex;
          align-items: center;
          margin: 1.5rem 0;
          color: #484f58;
          font-size: 0.8rem;
        }
        .divider::before,
        .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #30363d;
        }
        .divider::before {
          margin-right: 0.75rem;
        }
        .divider::after {
          margin-left: 0.75rem;
        }
        .info-text {
          color: #8b949e;
          font-size: 0.8rem;
          line-height: 1.5;
        }
        .info-text a {
          color: #58a6ff;
          text-decoration: none;
        }
        .info-text a:hover {
          text-decoration: underline;
        }
        .logo-icon {
          margin-bottom: 1.5rem;
        }
        .logo-icon svg {
          width: 48px;
          height: 48px;
          fill: #8b949e;
        }
        .error {
          color: #f85149;
          margin-top: 1rem;
          text-align: center;
          display: none;
          font-size: 0.85rem;
          padding: 0.5rem;
          background: rgba(248, 81, 73, 0.1);
          border-radius: 6px;
          border: 1px solid rgba(248, 81, 73, 0.2);
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .login-card {
          animation: fadeIn 0.4s ease-out;
        }
      </style>
      <div class="login-container">
        <div class="login-card">
          <div class="logo-icon">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <h2>Admin Console</h2>
          <p>Sign in to manage your application configurations</p>
          <button class="github-btn" id="github-login-btn">
            <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
            </svg>
            Sign in with GitHub
          </button>
          <div class="divider">Secure OAuth2 Authentication</div>
          <div class="info-text">
            You'll be redirected to GitHub to authorize access.
            Only your public profile information will be used.
          </div>
          <div class="error" id="error-msg">Authentication failed. Please try again.</div>
        </div>
      </div>
    `;
  }

  addEventListeners() {
    const btn = this.querySelector('#github-login-btn') as HTMLButtonElement;
    btn.addEventListener('click', () => {
      AuthService.loginWithGitHub();
    });
  }
}

customElements.define('login-page', LoginPage);
