export class AuthService {
    static loginWithGitHub(): void {
        // Redirect to the backend auth endpoint which will redirect to GitHub
        window.location.href = '/auth/login';
    }

    static handleCallback(token: string): void {
        localStorage.setItem('auth_token', token);
    }

    static logout() {
        localStorage.removeItem('auth_token');
        window.location.hash = '';
        window.location.reload();
    }

    static isAuthenticated(): boolean {
        return !!localStorage.getItem('auth_token');
    }

    static getToken(): string | null {
        return localStorage.getItem('auth_token');
    }
}
