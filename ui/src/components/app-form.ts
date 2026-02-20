import { ApiService } from '../services/api';
import { Application, ApplicationCreate, ApplicationUpdate } from '../models/types';
import { showToast } from './toast-notification';
import { hasValue } from '../utils/validation';

export class AppForm extends HTMLElement {
    private appId: string | null = null;
    private form: HTMLFormElement | null = null;
    private isEdit: boolean = false;

    static get observedAttributes() {
        return ['app-id'];
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        if (name === 'app-id' && oldValue !== newValue) {
            this.appId = newValue;
            this.isEdit = !!newValue;
            this.fetchData();
        }
    }

    async connectedCallback() {
        this.attachShadow({ mode: 'open' });
        this.render();

        const id = this.getAttribute('app-id');
        if (id) {
            this.appId = id;
            this.isEdit = true;
            await this.fetchData();
        }
    }

    async fetchData() {
        if (!this.appId) return;
        try {
            const app = await ApiService.get<Application>(`/applications/${this.appId}`);
            if (app) {
                this.populateForm(app);
            }
        } catch (error: any) {
            showToast(error.message, 'error');
        }
    }

    populateForm(app: Application) {
        const shadow = this.shadowRoot!;
        (shadow.getElementById('name') as HTMLInputElement).value = app.name;
        (shadow.getElementById('comments') as HTMLTextAreaElement).value = app.comments;
        shadow.getElementById('page-title')!.textContent = 'Edit Application';
        shadow.getElementById('submit-btn')!.textContent = 'Update Application';
    }

    render() {
        this.shadowRoot!.innerHTML = `
      <style>
        :host { display: block; max-width: 600px; margin: 0 auto; }
        h2 { margin-bottom: 1.5rem; font-size: 1.5rem; color: var(--text-color); }
        .form-group { margin-bottom: 1rem; }
        label { display: block; margin-bottom: 0.5rem; font-weight: 500; font-size: 0.875rem; color: var(--text-color); }
        input, textarea {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid var(--input-border);
          border-radius: 0.375rem;
          font-family: inherit;
          background: var(--input-bg);
          color: var(--text-color);
        }
        input:focus, textarea:focus {
           outline: none;
           border-color: var(--primary-color);
           box-shadow: 0 0 0 1px var(--primary-color);
        }
        textarea { height: 100px; resize: vertical; }
        .actions { display: flex; gap: 1rem; margin-top: 2rem; }
        button {
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          border: 1px solid var(--input-border);
          cursor: pointer;
          font-weight: 500;
        }
        .btn-primary { background: var(--primary-color); color: white; border-color: var(--primary-color); }
        .btn-primary:hover { background: var(--primary-hover); }
        .btn-secondary { background: var(--card-bg); color: var(--text-color); }
        .btn-secondary:hover { background: var(--bg-secondary); }
      </style>
      
      <h2 id="page-title">Create Application</h2>
      <form id="app-form">
        <div class="form-group">
          <label for="name">Name</label>
          <input type="text" id="name" name="name" required />
        </div>
        
        <div class="form-group">
          <label for="comments">Description</label>
          <textarea id="comments" name="comments"></textarea>
        </div>
        
        <div class="actions">
          <button type="button" class="btn-secondary" id="cancel">Cancel</button>
          <button type="submit" class="btn-primary" id="submit-btn">Create Application</button>
        </div>
      </form>
    `;

        this.form = this.shadowRoot!.getElementById('app-form') as HTMLFormElement;
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.shadowRoot!.getElementById('cancel')?.addEventListener('click', () => {
            window.location.hash = 'apps';
        });
    }

    async handleSubmit(e: Event) {
        e.preventDefault();
        const shadow = this.shadowRoot!;
        const name = (shadow.getElementById('name') as HTMLInputElement).value;
        const comments = (shadow.getElementById('comments') as HTMLTextAreaElement).value;

        if (!hasValue(name)) {
            showToast('Name is required', 'error');
            return;
        }

        try {
            if (this.isEdit && this.appId) {
                const update: ApplicationUpdate = { name, comments };
                await ApiService.put(`/applications/${this.appId}`, update);
                showToast('Application updated');
            } else {
                const create: ApplicationCreate = { name, comments };
                await ApiService.post('/applications', create);
                showToast('Application created');
            }
            window.location.hash = 'apps';
        } catch (error: any) {
            showToast(error.message, 'error');
        }
    }
}
customElements.define('app-form', AppForm);
