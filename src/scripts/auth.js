// /src/scripts/Auth.js
class AuthManager {
    constructor() {
        this.token = localStorage.getItem('token');
        this.user = JSON.parse(localStorage.getItem('user') || 'null');
    }

    isAuthenticated() {
        return !!this.token && !!this.user;
    }

    setAuth(token, user) {
        this.token = token;
        this.user = user;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
    }

    clearAuth() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }

    getToken() {
        return this.token;
    }

    getUser() {
        return this.user;
    }

    // Redirecionar baseado no role do usuário
    redirectByRole() {
        if (!this.user) return;

        switch(this.user.role) {
            case 'admin':
                window.location.href = '/src/pages/admin/dashboard.html';
                break;
            case 'professor':
                window.location.href = '/src/pages/professor/dashboard.html';
                break;
            case 'student':
            default:
                window.location.href = '/src/pages/user/dashboard.html';
                break;
        }
    }

    // Verificar se usuário está logado e redirecionar
    checkAuthAndRedirect() {
        if (this.isAuthenticated()) {
            this.redirectByRole();
        }
    }

    // Verificar permissões
    hasRole(role) {
        return this.user && this.user.role === role;
    }

    hasAnyRole(roles) {
        return this.user && roles.includes(this.user.role);
    }
}

// Instância global
const authManager = new AuthManager();