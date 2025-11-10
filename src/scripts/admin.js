import { authFetch, checkAuth } from './global.js';

document.addEventListener('DOMContentLoaded', async () => {
    const user = checkAuth();
    
    if (user && user.role === 'admin') {
        // Carregar dados dos cursos
        const courses = await authFetch('/courses');
        renderCourses(courses);
        
        // Carregar usuários
        const users = await authFetch('/users');
        renderUsers(users);
    }
});