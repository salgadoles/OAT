const API_BASE_URL = 'http://localhost:5000/api';

class API {
    static async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        // Adicionar token se existir
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erro na requisição');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Auth
    static async login(email, password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    }

    static async register(name, email, password) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password })
        });
    }

    static async getMe() {
        return this.request('/auth/me');
    }
}