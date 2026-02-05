import { ApiService } from './api';

export class AuthService {
    static async login(username: string, password: string): Promise<boolean> {
        try {
            const response = await ApiService.post<{ token: string }>('/login', { username, password });
            if (response && response.token) {
                localStorage.setItem('auth_token', response.token);
                return true;
            }
            return false;
        } catch (e) {
            console.error('Login failed', e);
            return false;
        }
    }

    static logout() {
        localStorage.removeItem('auth_token');
        window.location.hash = '';
        window.location.reload();
    }

    static isAuthenticated(): boolean {
        return !!localStorage.getItem('auth_token');
    }
}
