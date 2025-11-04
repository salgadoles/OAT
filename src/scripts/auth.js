class Auth {
    static isAuthenticated() {
        return localStorage.getItem('token') !== null;
    }

    static getUser() {
        const userData = localStorage.getItem('user');
        return userData ? JSON.parse(userData) : null;
    }

    static async login(email, password) {
        try {
            const data = await API.login(email, password);
            
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            this.redirectToDashboard(data.user.role);
            return data;
        } catch (error) {
            throw error;
        }
    }

    static async register(name, email, password) {
        try {
            const data = await API.register(name, email, password);
            
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            this.redirectToDashboard(data.user.role);
            return data;
        } catch (error) {
            throw error;
        }
    }

    static logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/src/pages/user/login.html';
    }

    static redirectToDashboard(role) {
        const basePath = '/src/pages';
        
        switch (role) {
            case 'admin':
                window.location.href = `${basePath}/admin/dashboard.html`;
                break;
            case 'teacher':
                window.location.href = `${basePath}/teacher/dashboard.html`;
                break;
            case 'student':
                window.location.href = `${basePath}/student/dashboard.html`;
                break;
            default:
                window.location.href = '/index.html';
        }
    }
}