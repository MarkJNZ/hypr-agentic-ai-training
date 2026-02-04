import { ApiService } from '../services/api';
import { Application, Configuration } from '../models/types';
import { showToast } from './toast-notification';

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
        h2 { margin: 0 0 0.5rem 0; font-size: 1.5rem; }
        .description { color: #6b7280; margin-bottom: 1rem; }
        .meta { font-size: 0.875rem; color: #9ca3af; font-family: monospace; }
        
        .section-header {
           display: flex;
           justify-content: space-between;
           align-items: center;
           margin-top: 2rem;
           margin-bottom: 1rem;
           padding-bottom: 0.5rem;
           border-bottom: 1px solid #e5e7eb;
        }
        h3 { margin: 0; font-size: 1.125rem; }
        
        table { width: 100%; border-collapse: collapse; background: white; border-radius: 0.5rem; overflow: hidden; box-shadow: 0 1px 3px 0 rgba(0,0,0,0.1); }
        th, td { padding: 1rem; text-align: left; border-bottom: 1px solid #e5e7eb; }
        th { background: #f9fafb; font-weight: 600; color: #4b5563; }
        
        button {
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          border: 1px solid #d1d5db;
          cursor: pointer;
        }
        .btn-primary { background: #3b82f6; color: white; border-color: #3b82f6; }
        .btn-sm { padding: 0.25rem 0.5rem; font-size: 0.875rem; }
        .btn-danger { background: #ef4444; color: white; border-color: #ef4444; }
        
        .no-data { color: #6b7280; font-style: italic; padding: 1rem; }
      </style>
      
      <div class="header">
        <a href="#apps" style="text-decoration: none; color: #6b7280; font-size: 0.875rem;">&larr; Back to Apps</a>
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
      
      <confirmation-dialog id="confirm"></confirmation-dialog>
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
        this.confirmDelete(id!);
      });
    });
  }

  confirmDelete(id: string) {
    const dialog = this.shadowRoot!.getElementById('confirm') as any;
    dialog.open('Are you sure you want to delete this configuration?', async () => {
      try {
        await ApiService.delete(`/configurations/${id}`);
        showToast('Configuration deleted');
        await this.fetchData(); // Reload
      } catch (e: any) {
        showToast(e.message, 'error');
      }
    });
  }
}
customElements.define('app-detail', AppDetail);
