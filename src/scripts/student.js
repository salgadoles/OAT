class StudentDashboard {
    static currentCourseId = null;

    static async loadCourses() {
        try {
            this.showLoading(true);
            const courses = await API.getCourses();
            this.displayCourses(courses);
        } catch (error) {
            this.showMessage('Erro ao carregar cursos: ' + error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    static displayCourses(courses) {
        const container = document.getElementById('coursesContainer');
        const noCourses = document.getElementById('noCourses');
        
        if (!container) return;

        if (courses.length === 0) {
            container.style.display = 'none';
            noCourses.style.display = 'block';
            return;
        }

        container.style.display = 'grid';
        noCourses.style.display = 'none';

        container.innerHTML = courses.map(course => `
            // <div class="course-card" data-course-id="${course._id}">
            //     <h3>${course.title}</h3>
            //     <p class="course-description">${course.description}</p>
            //     <div class="course-meta">
            //         <span class="instructor">👨‍🏫 ${course.instructor?.name || 'Professor'}</span>
            //         <span class="level">📊 ${this.getLevelText(course.level)}</span>
            //         <span class="duration">⏱️ ${course.duration}h</span>
            //         <span class="students">👥 ${course.studentsEnrolled || 0} alunos</span>
            //         <span class="category">📚 ${course.category}</span>
            //     </div>
            //     <div class="course-actions">
            //         <button class="btn-primary" onclick="StudentDashboard.viewCourseDetails('${course._id}')">
            //             Ver Detalhes
            //         </button>
            //     </div>
            // </div>
        `).join('');
    }

    static getLevelText(level) {
        const levels = {
            'beginner': 'Iniciante',
            'intermediate': 'Intermediário', 
            'advanced': 'Avançado'
        };
        return levels[level] || level;
    }

    static async viewCourseDetails(courseId) {
        try {
            this.showLoading(true);
            const course = await API.getCourse(courseId);
            this.displayCourseModal(course);
        } catch (error) {
            this.showMessage('Erro ao carregar curso: ' + error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    static displayCourseModal(course) {
        this.currentCourseId = course._id;
        
        const modal = document.getElementById('courseModal');
        const title = document.getElementById('modalCourseTitle');
        const content = document.getElementById('modalCourseContent');
        const enrollButton = document.getElementById('enrollButton');

        if (!modal || !title || !content) return;

        title.textContent = course.title;
        
        content.innerHTML = `
            <div class="course-details">
                <p><strong>📝 Descrição:</strong> ${course.description}</p>
                <p><strong>👨‍🏫 Professor:</strong> ${course.instructor?.name || 'Não definido'}</p>
                <p><strong>📚 Categoria:</strong> ${course.category}</p>
                <p><strong>📊 Nível:</strong> ${this.getLevelText(course.level)}</p>
                <p><strong>⏱️ Duração:</strong> ${course.duration} horas</p>
                <p><strong>👥 Alunos matriculados:</strong> ${course.studentsEnrolled || 0}</p>
                
                ${course.requirements && course.requirements.length > 0 ? `
                    <div class="requirements">
                        <strong>🎯 Pré-requisitos:</strong>
                        <ul>
                            ${course.requirements.map(req => `<li>${req}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
                
                ${course.learningObjectives && course.learningObjectives.length > 0 ? `
                    <div class="objectives">
                        <strong>🎓 O que você vai aprender:</strong>
                        <ul>
                            ${course.learningObjectives.map(obj => `<li>${obj}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
            </div>
        `;

        // Verificar se já está matriculado
        enrollButton.textContent = 'Entrar na Turma';
        enrollButton.disabled = false;
        enrollButton.onclick = () => this.enrollInCourse(course._id);

        modal.style.display = 'flex';
    }

    static async enrollInCourse(courseId) {
        try {
            const enrollButton = document.getElementById('enrollButton');
            enrollButton.disabled = true;
            enrollButton.textContent = 'Realizando matrícula...';

            await API.enrollInCourse(courseId);
            this.showMessage('🎉 Matrícula realizada com sucesso!', 'success');
            enrollButton.textContent = 'Matricula Realizada';
            // Fechar modal após 2 segundos
            setTimeout(() => {
                this.closeCourseModal();
                this.loadCourses(); // Recarregar lista
            }, 2000);

        } catch (error) {
            this.showMessage('❌ Erro na matrícula: ' + error.message, 'error');
            const enrollButton = document.getElementById('enrollButton');
            enrollButton.disabled = false;
            enrollButton.textContent = 'Entrar na Turma';
        }
    }

    static closeCourseModal() {
        const modal = document.getElementById('courseModal');
        if (modal) {
            modal.style.display = 'none';
        }
        this.currentCourseId = null;
    }

    static showLoading(show = true) {
        const loading = document.getElementById('loading');
        const container = document.getElementById('coursesContainer');
        
        if (loading) loading.style.display = show ? 'block' : 'none';
        if (container) container.style.display = show ? 'none' : 'grid';
    }

    static showMessage(message, type = 'info') {
        // Usar a função global do app.js
        if (typeof showMessage === 'function') {
            showMessage(message, type);
        } else {
            alert(message);
        }
    }
}

// Filtros
function setupFilters() {
    const categoryFilter = document.getElementById('categoryFilter');
    const levelFilter = document.getElementById('levelFilter');

    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterCourses);
    }
    if (levelFilter) {
        levelFilter.addEventListener('change', filterCourses);
    }
}

function filterCourses() {
    // Implementação simples de filtro - pode ser melhorada
    StudentDashboard.loadCourses();
}

// Inicializar dashboard do estudante
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('student-dashboard.html')) {
        StudentDashboard.loadCourses();
        setupFilters();
        
        // Configurar logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (confirm('Tem certeza que deseja sair?')) {
                    Auth.logout();
                }
            });
        }
    }
});

// Fechar modal clicando fora
document.addEventListener('click', function(event) {
    const modal = document.getElementById('courseModal');
    if (event.target === modal) {
        StudentDashboard.closeCourseModal();
    }
});