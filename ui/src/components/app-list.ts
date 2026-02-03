import { ApiService } from '../services/api';
import { Application } from '../models/types';
import { showToast } from './toast-notification';

export class AppList extends HTMLElement {
    private apps: Application[] = [];

    async connectedCallback() {
        this.attachShadow({ mode: 'open' });
        this.render();
        await this.fetchApps();
    }

    async fetchApps() {
        try {
            this.apps = await ApiService.get<Application[]>('/applications');
            this.renderList();
        } catch (error: any) {
            showToast(error.message, 'error');
        }
    }

    render() {
        this.shadowRoot!.innerHTML = `
      <style>
        :host { display: block; }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }
        h2 { margin: 0; font-size: 1.5rem; }
        .controls { display: flex; gap: 1rem; }
        input[type="text"] {
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          min-width: 250px;
        }
        button {
          padding: 0.5rem 1rem;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
          font-weight: 500;
        }
        button:hover { background: #2563eb; }
        
        table { width: 100%; border-collapse: collapse; background: white; border-radius: 0.5rem; overflow: hidden; box-shadow: 0 1px 3px 0 rgba(0,0,0,0.1); }
        th, td { padding: 1rem; text-align: left; border-bottom: 1px solid #e5e7eb; }
        th { background: #f9fafb; font-weight: 600; color: #4b5563; }
        tr:last-child td { border-bottom: none; }
        tr:hover { background: #f9fafb; }
        
        .actions { display: flex; gap: 0.5rem; }
        .btn-sm { padding: 0.25rem 0.5rem; font-size: 0.875rem; }
        .btn-outline { background: white; border: 1px solid #d1d5db; color: #374151; }
        .btn-outline:hover { background: #f3f4f6; }
        .btn-danger { background: #ef4444; }
        .btn-danger:hover { background: #dc2626; }
      </style>
      
      <div class="header">
        <h2>Applications</h2>
        <div class="controls">
          <input type="text" id="search" placeholder="Search applications..." />
          <button id="create-btn">Create New App</button>
        </div>
      </div>
      
      <div id="list-container">
        <p>Loading...</p>
      </div>
      
      <confirmation-dialog id="confirm"></confirmation-dialog>
    `;

        this.shadowRoot!.getElementById('create-btn')?.addEventListener('click', () => {
            window.location.hash = 'apps/create';
        });

        this.shadowRoot!.getElementById('search')?.addEventListener('input', (e) => {
            const term = (e.target as HTMLInputElement).value.toLowerCase();
            this.renderList(term);
        });
    }

    renderList(filter = '') {
        const container = this.shadowRoot!.getElementById('list-container');
        if (!container) return;

        if (this.apps.length === 0) {
            container.innerHTML = '<p>No applications found.</p>';
            return;
        }

        const filtered = this.apps.filter(app =>
            app.name.toLowerCase().includes(filter) ||
            app.comments.toLowerCase().includes(filter)
        );

        const html = `
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>ID</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${filtered.map(app => `
            <tr>
              <td><a href="#apps/${app.id}" style="font-weight: 600; color: #3b82f6; text-decoration: none;">${app.name}</a></td>
              <td>${app.comments}</td>
              <td style="font-family: monospace; color: #6b7280; font-size: 0.85em;">${app.id}</td>
              <td class="actions">
                <button class="btn-sm btn-outline ed-btn" data-id="${app.id}">Edit</button>
                <button class="btn-sm btn-danger del-btn" data-id="${app.id}">Delete</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

        container.innerHTML = html;

        container.querySelectorAll('.ed-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = (e.target as HTMLElement).dataset.id;
                window.location.hash = `apps/edit/${id}`;
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
        dialog.open('Are you sure you want to delete this application? This cannot be undone.', async () => {
            try {
                await ApiService.delete(`/applications/${id}`);
                showToast('Application deleted');
                await this.fetchApps();
            } catch (e: any) {
                showToast(e.message, 'error');
            }
        });
    }
}
customElements.define('app-list', AppList);
