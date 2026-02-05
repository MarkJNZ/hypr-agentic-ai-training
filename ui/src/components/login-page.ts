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
          background-color: var(--bg-color);
        }
        .login-card {
          background: var(--card-bg);
          padding: 2rem;
          border-radius: 8px;
          box-shadow: var(--shadow);
          width: 100%;
          max-width: 400px;
        }
        h2 {
          text-align: center;
          color: var(--primary-color);
          margin-bottom: 2rem;
        }
        .form-group {
          margin-bottom: 1rem;
        }
        label {
          display: block;
          margin-bottom: 0.5rem;
          color: var(--text-color);
        }
        input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid var(--border-color);
          border-radius: 4px;
          background: var(--input-bg);
          color: var(--text-color);
          box-sizing: border-box;
        }
        button {
          width: 100%;
          padding: 0.75rem;
          background: var(--primary-color);
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 1rem;
          cursor: pointer;
          margin-top: 1rem;
        }
        button:hover {
          opacity: 0.9;
        }
        .error {
            color: #ef4444;
            margin-top: 1rem;
            text-align: center;
            display: none;
        }
      </style>
      <div class="login-container">
        <div class="login-card">
          <h2>Admin Login</h2>
          <form id="login-form">
            <div class="form-group">
              <label for="username">Username</label>
              <input type="text" id="username" name="username" required>
            </div>
            <div class="form-group">
              <label for="password">Password</label>
              <input type="password" id="password" name="password" required>
            </div>
            <button type="submit">Login</button>
            <div class="error" id="error-msg">Invalid credentials</div>
          </form>
        </div>
      </div>
    `;
  }

  addEventListeners() {
    const form = this.querySelector('#login-form') as HTMLFormElement;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = (this.querySelector('#username') as HTMLInputElement).value;
      const password = (this.querySelector('#password') as HTMLInputElement).value;
      const errorMsg = this.querySelector('#error-msg') as HTMLElement;

      const success = await AuthService.login(username, password);

      if (success) {
        window.location.hash = '#apps';
        window.location.reload(); // Reload to clear login page state/check auth in router
      } else {
        errorMsg.style.display = 'block';
      }
    });
  }
}

customElements.define('login-page', LoginPage);
