import { ApiService } from '../services/api';
import { Configuration, ConfigurationCreate, ConfigurationUpdate } from '../models/types';
import { showToast } from './toast-notification';
import { hasValue } from '../utils/validation';

export class ConfigEditor extends HTMLElement {
    private configId: string | null = null;
    private appId: string | null = null;
    private isEdit: boolean = false;
    private isJsonMode: boolean = false;

    // State for KV editor
    private kvPairs: { key: string; value: any }[] = [];

    static get observedAttributes() {
        return ['config-id', 'app-id'];
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        if (oldValue === newValue) return;
        if (name === 'config-id') {
            this.configId = newValue;
            this.isEdit = true;
        }
        if (name === 'app-id') {
            this.appId = newValue;
        }
        this.initialFetch();
    }

    async connectedCallback() {
        this.attachShadow({ mode: 'open' });
        this.render();
        this.initialFetch();
    }

    async initialFetch() {
        if (this.isEdit && this.configId) {
            try {
                const config = await ApiService.get<Configuration>(`/configurations/${this.configId}`);
                if (config) {
                    this.appId = config.applicationId; // Set appId for back nav
                    this.populateForm(config);
                }
            } catch (e: any) {
                showToast(e.message, 'error');
            }
        }
    }

    populateForm(config: Configuration) {
        const shadow = this.shadowRoot!;
        (shadow.getElementById('name') as HTMLInputElement).value = config.name;
        (shadow.getElementById('comments') as HTMLTextAreaElement).value = config.comments;
        shadow.getElementById('page-title')!.textContent = 'Edit Configuration';
        shadow.getElementById('submit-btn')!.textContent = 'Update Configuration';

        // Load Config Data
        if (config.config) {
            // If complex nested object, default to JSON mode?
            // For now, flatten to KV pairs if simple, else JSON.
            // Or just load into both.
            this.kvPairs = Object.entries(config.config).map(([key, value]) => ({ key, value }));
            this.renderKvRows();
            (shadow.getElementById('json-editor') as HTMLTextAreaElement).value = JSON.stringify(config.config, null, 2);
        }
    }

    render() {
        this.shadowRoot!.innerHTML = `
      <style>
        :host { display: block; max-width: 800px; margin: 0 auto; }
        h2 { margin-bottom: 1.5rem; color: var(--text-color); }
        .form-group { margin-bottom: 1rem; }
        label { display: block; margin-bottom: 0.5rem; font-weight: 500; color: var(--text-color); }
        input[type="text"], textarea { width: 100%; padding: 0.5rem; border: 1px solid var(--input-border); border-radius: 0.375rem; font-family: inherit; background: var(--input-bg); color: var(--text-color); }
        .controls { display: flex; gap: 1rem; margin-bottom: 1rem; align-items: center; }
        
        /* KV Editor Styles */
        .kv-row { display: flex; gap: 0.5rem; margin-bottom: 0.5rem; }
        .kv-key { flex: 1; }
        .kv-val { flex: 2; }
        .btn-icon { padding: 0.5rem; color: var(--danger-color); border: 1px solid var(--input-border); background: var(--card-bg); cursor: pointer; border-radius: 0.25rem; }
        
        .hidden { display: none; }
        
        button { padding: 0.5rem 1rem; border-radius: 0.375rem; border: 1px solid var(--input-border); cursor: pointer; font-weight: 500; color: var(--text-color); background: var(--card-bg); }
        .btn-primary { background: var(--primary-color); color: white; border-color: var(--primary-color); }
        .btn-secondary { background: var(--card-bg); color: var(--text-color); }
        
        .mode-toggle { margin-bottom: 1rem; color: var(--text-color); }
      </style>
      
      <h2 id="page-title">Create Configuration</h2>
      
      <form id="config-form">
        <div class="form-group">
          <label for="name">Name</label>
          <input type="text" id="name" required />
        </div>
        
        <div class="form-group">
          <label for="comments">Description</label>
          <input type="text" id="comments" />
        </div>
        
        <div class="mode-toggle">
            <label>
                <input type="checkbox" id="mode-switch" /> Edit as JSON
            </label>
        </div>
        
        <div id="visual-editor">
            <label>Configuration Keys</label>
            <div id="kv-container"></div>
            <button type="button" id="add-row" style="margin-top: 0.5rem;">+ Add Key-Value Pair</button>
        </div>
        
        <div id="json-wrapper" class="hidden">
            <label>JSON Config</label>
            <textarea id="json-editor" rows="15" style="font-family: monospace;"></textarea>
        </div>
        
        <div class="controls" style="margin-top: 2rem;">
            <button type="button" class="btn-secondary" id="cancel">Cancel</button>
            <button type="submit" class="btn-primary" id="submit-btn">Create Configuration</button>
        </div>
      </form>
    `;

        this.bindEvents();
        this.addKvRow(); // Start with one empty row
    }

    bindEvents() {
        const shadow = this.shadowRoot!;

        const modeSwitch = shadow.getElementById('mode-switch') as HTMLInputElement;
        modeSwitch.addEventListener('change', () => {
            this.isJsonMode = modeSwitch.checked;
            if (this.isJsonMode) {
                // Sync KV to JSON
                this.syncKvToJson();
                shadow.getElementById('visual-editor')?.classList.add('hidden');
                shadow.getElementById('json-wrapper')?.classList.remove('hidden');
            } else {
                // Sync JSON to KV (try parse)
                if (this.syncJsonToKv()) {
                    shadow.getElementById('visual-editor')?.classList.remove('hidden');
                    shadow.getElementById('json-wrapper')?.classList.add('hidden');
                } else {
                    modeSwitch.checked = true; // Revert if parse error
                    this.isJsonMode = true;
                    showToast('Invalid JSON, cannot switch to Visual mode', 'error');
                }
            }
        });

        shadow.getElementById('add-row')?.addEventListener('click', () => this.addKvRow());

        shadow.getElementById('cancel')?.addEventListener('click', () => {
            if (this.appId) window.location.hash = `apps/${this.appId}`;
            else window.location.hash = 'apps';
        });

        shadow.getElementById('config-form')?.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    addKvRow(key = '', value = '') {
        this.kvPairs.push({ key, value });
        this.renderKvRows();
    }

    removeKvRow(index: number) {
        this.kvPairs.splice(index, 1);
        this.renderKvRows();
    }

    renderKvRows() {
        const container = this.shadowRoot!.getElementById('kv-container');
        if (!container) return;
        container.innerHTML = '';

        this.kvPairs.forEach((pair, index) => {
            const row = document.createElement('div');
            row.className = 'kv-row';
            row.innerHTML = `
            <input type="text" class="kv-key" placeholder="Key" value="${pair.key}" data-index="${index}">
            <input type="text" class="kv-val" placeholder="Value" value="${typeof pair.value === 'object' ? JSON.stringify(pair.value) : pair.value}" data-index="${index}">
            <button type="button" class="btn-icon" data-index="${index}">×</button>
          `;
            container.appendChild(row);
        });

        // Bind events
        container.querySelectorAll('.kv-key').forEach(el => {
            el.addEventListener('input', (e) => {
                const idx = parseInt((e.target as HTMLElement).dataset.index!);
                this.kvPairs[idx].key = (e.target as HTMLInputElement).value;
            });
        });
        container.querySelectorAll('.kv-val').forEach(el => {
            el.addEventListener('input', (e) => {
                const idx = parseInt((e.target as HTMLElement).dataset.index!);
                this.kvPairs[idx].value = (e.target as HTMLInputElement).value;
            });
        });
        container.querySelectorAll('.btn-icon').forEach(el => {
            el.addEventListener('click', (e) => {
                const idx = parseInt((e.target as HTMLElement).dataset.index!);
                this.removeKvRow(idx);
            });
        });
    }

    syncKvToJson() {
        const config: any = {};
        this.kvPairs.forEach(pair => {
            // Attempt to auto-detect primitives
            let val = pair.value;
            if (val === 'true') val = true;
            else if (val === 'false') val = false;
            else if (!isNaN(Number(val)) && val !== '') val = Number(val);

            if (pair.key) config[pair.key] = val;
        });
        const jsonEl = this.shadowRoot!.getElementById('json-editor') as HTMLTextAreaElement;
        jsonEl.value = JSON.stringify(config, null, 2);
    }

    syncJsonToKv(): boolean {
        try {
            const jsonEl = this.shadowRoot!.getElementById('json-editor') as HTMLTextAreaElement;
            const config = JSON.parse(jsonEl.value || '{}');
            this.kvPairs = Object.entries(config).map(([key, value]) => ({ key, value }));
            this.renderKvRows();
            return true;
        } catch (e) {
            return false;
        }
    }

    async handleSubmit(e: Event) {
        e.preventDefault();
        const shadow = this.shadowRoot!;
        const name = (shadow.getElementById('name') as HTMLInputElement).value;
        const comments = (shadow.getElementById('comments') as HTMLInputElement).value; // Fixed input type

        if (!hasValue(name)) {
            showToast('Name is required', 'error');
            return;
        }

        let configData: any = {};

        if (this.isJsonMode) {
            try {
                const jsonVal = (shadow.getElementById('json-editor') as HTMLTextAreaElement).value;
                configData = JSON.parse(jsonVal || '{}');
            } catch {
                showToast('Invalid JSON', 'error');
                return;
            }
        } else {
            this.syncKvToJson(); // Ensure KV is latest
            // Parse again via sync logic
            // Actually syncKvToJson updates the textarea, so we can just grab from kvPairs logic
            this.kvPairs.forEach(pair => {
                let val = pair.value;
                if (val === 'true') val = true;
                else if (val === 'false') val = false;
                else if (!isNaN(Number(val)) && val !== '') val = Number(val);
                if (pair.key) configData[pair.key] = val;
            });
        }

        try {
            if (this.isEdit && this.configId) {
                const update: ConfigurationUpdate = { name, comments, config: configData };
                await ApiService.put(`/configurations/${this.configId}`, update);
                showToast('Configuration updated');
            } else {
                if (!this.appId) throw new Error('Application ID missing');
                const create: ConfigurationCreate = { applicationId: this.appId, name, comments, config: configData };
                await ApiService.post('/configurations', create);
                showToast('Configuration created');
            }

            if (this.appId) window.location.hash = `apps/${this.appId}`;
            else window.location.hash = 'apps';

        } catch (e: any) {
            showToast(e.message, 'error');
        }
    }
}
customElements.define('config-editor', ConfigEditor);
