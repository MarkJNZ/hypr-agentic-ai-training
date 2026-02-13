interface RequestOptions extends RequestInit {
    data?: any;
}

export class ApiService {
    private static async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
        const url = `/api/v1${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        const token = localStorage.getItem('auth_token');
        if (token) {
            (headers as any)['Authorization'] = `Bearer ${token}`;
        }

        const config: RequestInit = {
            ...options,
            headers,
        };

        if (options.data) {
            config.body = JSON.stringify(options.data);
        }

        const response = await fetch(url, config);

        if (!response.ok) {
            let errorMessage = response.statusText;
            try {
                const error = await response.json();
                if (error && error.message) {
                    errorMessage = error.message;
                }
            } catch {
                // ignore JSON parse error
            }
            throw new Error(errorMessage);
        }

        // Return null for 204 No Content
        if (response.status === 204) {
            return null as T;
        }

        return response.json();
    }

    static get<T>(endpoint: string) {
        return this.request<T>(endpoint, { method: 'GET' });
    }

    static post<T>(endpoint: string, data: any) {
        return this.request<T>(endpoint, { method: 'POST', data });
    }

    static put<T>(endpoint: string, data: any) {
        return this.request<T>(endpoint, { method: 'PUT', data });
    }

    static delete<T>(endpoint: string) {
        return this.request<T>(endpoint, { method: 'DELETE' });
    }
}
