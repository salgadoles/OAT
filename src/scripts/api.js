// /src/scripts/api.js
const API_BASE_URL = 'http://localhost:5000/api'; // ✅ Use porta 5000

export const api = {
    // Auth
    async register(userData) {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        return await response.json();
    },

    async login(credentials) {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });
        return await response.json();
    },

    async getProfile() {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return await response.json();
    },

    // Courses
    async getCourses() {
        const response = await fetch(`${API_BASE_URL}/courses`);
        return await response.json();
    },

    async createCourse(courseData) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/courses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(courseData)
        });
        return await response.json();
    }
};