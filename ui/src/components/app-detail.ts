import { ApiService } from '../services/api';
import { Application, Configuration } from '../models/types';
import { showToast } from './toast-notification';
import { ConfirmationDialog } from './confirmation-dialog';

export class AppDetail extends HTMLElement {
  private appId: string | null = null;
  private app: Application | null = null;
  private configs: Configuration[] = [];

  static get observedAttributes() {
    return ['app-id'];
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === 'app-id' && oldValue !== newValue) {
      this.appId = newValue;
      this.fetchData();
    }
  }

  async connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.render(); // Initial render
    if (this.appId) {
      await this.fetchData();
    }
  }

  async fetchData() {
    if (!this.appId) return;
    try {
      this.app = await ApiService.get<Application>(`/applications/${this.appId}`);
      this.render(); // Re-render with app info

      if (this.app && this.app.configurationIds && this.app.configurationIds.length > 0) {
        // Parallel fetch of configs
        const promises = this.app.configurationIds.map(id =>
          ApiService.get<Configuration>(`/configurations/${id}`).catch(() => null)
        );
        const results = await Promise.all(promises);
        this.configs = results.filter(c => c !== null) as Configuration[];
        this.renderConfigs();
      } else {
        this.configs = [];
        this.renderConfigs();
      }
    } catch (error: any) {
      showToast(error.message, 'error');
    }
  }

  render() {
    this.shadowRoot!.innerHTML = `
      <style>
        :host { display: block; }
        .header { margin-bottom: 2rem; }
        h2 { margin: 0 0 0.5rem 0; font-size: 1.5rem; color: var(--text-color); }
        .description { color: var(--text-secondary); margin-bottom: 1rem; }
        .meta { font-size: 0.875rem; color: var(--text-muted); font-family: monospace; }
        
        .section-header {
           display: flex;
           justify-content: space-between;
           align-items: center;
           margin-top: 2rem;
           margin-bottom: 1rem;
           padding-bottom: 0.5rem;
           border-bottom: 1px solid var(--border-color);
        }
        h3 { margin: 0; font-size: 1.125rem; color: var(--text-color); }
        
        table { width: 100%; border-collapse: collapse; background: var(--card-bg); border-radius: 0.5rem; overflow: hidden; box-shadow: var(--shadow); }
        th, td { padding: 1rem; text-align: left; border-bottom: 1px solid var(--border-color); color: var(--text-color); }
        th { background: var(--bg-secondary); font-weight: 600; color: var(--text-secondary); }
        
        button {
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          border: 1px solid var(--input-border);
          cursor: pointer;
          color: var(--text-color);
          background: var(--card-bg);
        }
        .btn-primary { background: var(--primary-color); color: white; border-color: var(--primary-color); }
        .btn-sm { padding: 0.25rem 0.5rem; font-size: 0.875rem; }
        .btn-danger { background: var(--danger-color); color: white; border-color: var(--danger-color); }
        
        .no-data { color: var(--text-secondary); font-style: italic; padding: 1rem; }
      </style>
      
      <div class="header">
        <confirmation-dialog id="confirm-dialog"></confirmation-dialog>
        <a href="#apps" style="text-decoration: none; color: var(--text-secondary); font-size: 0.875rem;">&larr; Back to Apps</a>
        ${this.app ? `
            <div style="margin-top: 1rem;">
                <h2>${this.app.name}</h2>
                <div class="description">${this.app.comments}</div>
                <div class="meta">ID: ${this.app.id}</div>
            </div>
        ` : '<div>Loading...</div>'}
      </div>
      
      <div class="section-header">
        <h3>Configurations</h3>
        <button id="add-config" class="btn-primary">Add Configuration</button>
      </div>
      
      <div id="config-list">
        <p>Loading configurations...</p>
      </div>
    `;

    this.shadowRoot!.getElementById('add-config')?.addEventListener('click', () => {
      if (this.appId) window.location.hash = `configs/create/${this.appId}`;
    });
  }

  renderConfigs() {
    const container = this.shadowRoot!.getElementById('config-list');
    if (!container) return;

    if (this.configs.length === 0) {
      container.innerHTML = '<div class="no-data">No configurations found.</div>';
      return;
    }

    container.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${this.configs.map(c => `
            <tr>
              <td>${c.name}</td>
              <td>${c.comments}</td>
              <td>
                <button class="btn-sm ed-btn" data-id="${c.id}">Edit</button>
                <button class="btn-sm btn-danger del-btn" data-id="${c.id}">Delete</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    container.querySelectorAll('.ed-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = (e.target as HTMLElement).dataset.id;
        window.location.hash = `configs/edit/${id}`;
      });
    });

    container.querySelectorAll('.del-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = (e.target as HTMLElement).dataset.id;
        const dialog = this.shadowRoot!.getElementById('confirm-dialog') as ConfirmationDialog;
        dialog.open(
          'Are you sure you want to delete this configuration?',
          async () => {
            try {
              await ApiService.delete(`/configurations/${id}`);
              this.configs = this.configs.filter(c => c.id !== id);
              this.renderConfigs();
              showToast('Configuration deleted', 'success');
            } catch (error: any) {
              showToast(error.message, 'error');
            }
          },
          'Delete Configuration'
        );
      });
    });

  }
}
customElements.define('app-detail', AppDetail);
