// /src/scripts/professor-courses.js
class ProfessorCourses {
    constructor() {
        this.apiBase = 'http://localhost:5000/api';
        this.courses = [];
        this.currentUser = null;
    }

    // Inicializar
    async init() {
        await this.checkAuth();
        await this.loadProfessorCourses();
        this.setupEventListeners();
    }

    // Verificar autenticação
    async checkAuth() {
        this.currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const token = localStorage.getItem('token');

        if (!token || !this.currentUser.id) {
            alert('⚠️ Você precisa estar logado como professor');
            window.location.href = '/login';
            return;
        }

        if (this.currentUser.role !== 'professor') {
            alert('❌ Acesso permitido apenas para professores');
            window.location.href = '/dashboard.html';
            return;
        }

        console.log('👤 Professor logado:', this.currentUser.name);
    }

    // Carregar cursos do professor
    async loadProfessorCourses() {
        try {
            const token = localStorage.getItem('token');
            
            console.log('📡 Buscando cursos do professor...');
            
            const response = await fetch(`${this.apiBase}/courses`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Erro ${response.status}: ${response.statusText}`);
            }

            const allCourses = await response.json();
            
            // Filtrar cursos do professor logado
            this.courses = allCourses.filter(course => 
                course.instructor && course.instructor._id === this.currentUser.id
            );

            console.log(`✅ ${this.courses.length} cursos encontrados para o professor`);
            
            this.renderCourses();
            this.updateStats();

        } catch (error) {
            console.error('💥 Erro ao carregar cursos:', error);
            this.showErrorMessage('Erro ao carregar seus cursos.');
        }
    }

    // Renderizar cursos mantendo o estilo original
    renderCourses() {
        const coursesContainer = document.querySelector('.classes-grid');
        
        if (!coursesContainer) {
            console.error('❌ Container de cursos não encontrado');
            return;
        }

        // Se não há cursos, mostrar mensagem
        if (this.courses.length === 0) {
            coursesContainer.innerHTML = `
                <div class="no-courses" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                    <div style="background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <i class="fas fa-book-open" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
                        <h3 style="color: #333; margin-bottom: 1rem;">Nenhum curso criado ainda</h3>
                        <p style="color: #666; margin-bottom: 1.5rem;">Comece criando seu primeiro curso!</p>
                        <button onclick="window.location.href='/criarCurso'" 
                                style="background: #4a90e2; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer; font-size: 1rem;">
                            <i class="fas fa-plus"></i> Criar Primeiro Curso
                        </button>
                    </div>
                </div>
            `;
            return;
        }

        // Limpar apenas o conteúdo interno dos cards existentes e atualizar com dados reais
        const existingCards = coursesContainer.querySelectorAll('.class-card');
        
        this.courses.forEach((course, index) => {
            let card;
            
            // Reutilizar card existente ou criar novo se necessário
            if (existingCards[index]) {
                card = existingCards[index];
            } else {
                card = document.createElement('div');
                card.className = 'class-card';
                coursesContainer.appendChild(card);
            }
            
            this.updateCardContent(card, course);
        });

        // Remover cards extras se houver menos cursos que cards
        const totalCards = coursesContainer.querySelectorAll('.class-card');
        if (totalCards.length > this.courses.length) {
            for (let i = this.courses.length; i < totalCards.length; i++) {
                totalCards[i].remove();
            }
        }

        console.log(`🎨 ${this.courses.length} cursos renderizados`);
    }

    // Atualizar conteúdo do card mantendo estrutura original
    updateCardContent(cardElement, course) {
        // Determinar texto da tag baseado no status
        const statusText = this.getStatusText(course.status);
        
        cardElement.innerHTML = `
            <div class="class-header">
                <span class="class-tag">${statusText}</span>
                <div class="class-actions">
                    <i class="fas fa-users class-icon" title="Alunos: ${course.studentsEnrolled || 0}"></i>
                    <i class="fas fa-edit class-icon" onclick="professorCourses.editCourse('${course._id}')" title="Editar Curso"></i>
                </div>
            </div>
            <div class="class-title">${this.truncateText(course.title, 50)}</div>
            
            <!-- Informações adicionais (opcionais) -->
            <div style="margin-top: 0.5rem; font-size: 0.8rem; color: #666;">
                <span>${course.category} • ${course.level}</span>
                ${course.price > 0 ? `<span style="margin-left: 0.5rem;">• R$ ${course.price}</span>` : ''}
            </div>
        `;

        // Adicionar interações
        this.addCardInteractions(cardElement, course);
    }

    // Texto para a tag baseado no status
    getStatusText(status) {
        const statusMap = {
            'draft': 'RASCUNHO',
            'submitted': 'EM ANÁLISE', 
            'approved': 'APROVADO',
            'rejected': 'AJUSTES',
            'published': 'PUBLICADO'
        };
        return statusMap[status] || status.toUpperCase();
    }

    // Atualizar estatísticas no header
    updateStats() {
        const stats = {
            total: this.courses.length,
            published: this.courses.filter(c => c.status === 'published').length,
            draft: this.courses.filter(c => c.status === 'draft').length
        };

        // Atualizar contador no breadcrumb
        const countElement = document.querySelector('.breadcrumb span');
        if (countElement) {
            countElement.textContent = stats.total;
        }

        // Atualizar texto do breadcrumb
        const textElement = document.querySelector('.breadcrumb-text');
        if (textElement) {
            textElement.innerHTML = `
                <div>Meus cursos criados</div>
                <div>${stats.published} publicados • ${stats.draft} rascunhos</div>
            `;
        }

        console.log('📊 Estatísticas atualizadas:', stats);
    }

    // Ações dos cursos
    editCourse(courseId) {
        if (confirm('Deseja editar este curso?')) {
            window.location.href = `/editar-curso.html?id=${courseId}`;
        }
    }

    // Adicionar interações aos cards
    addCardInteractions(cardElement, course) {
        // Clique no card abre detalhes (exceto nos ícones)
        cardElement.addEventListener('click', function(e) {
            if (!e.target.closest('.class-actions')) {
                window.location.href = `/detalhes-curso.html?id=${course._id}`;
            }
        });

        // Manter os efeitos de hover originais do seu CSS
        // Se quiser adicionar efeitos extras:
        cardElement.style.transition = 'all 0.3s ease';
        cardElement.style.cursor = 'pointer';
    }

    // Utilitários
    truncateText(text, maxLength) {
        if (!text) return 'Sem título';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    showErrorMessage(message) {
        const container = document.querySelector('.classes-grid');
        if (container) {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; background: white; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: #dc3545; margin-bottom: 1rem;"></i>
                    <h3 style="color: #333; margin-bottom: 1rem;">Erro ao carregar cursos</h3>
                    <p style="color: #666; margin-bottom: 1.5rem;">${message}</p>
                    <button onclick="professorCourses.loadProfessorCourses()" 
                            style="background: #28a745; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer;">
                        <i class="fas fa-redo"></i> Tentar Novamente
                    </button>
                </div>
            `;
        }
    }

    setupEventListeners() {
        // Logout
        const logoutBtn = document.querySelector('.user-percentage');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login.html';
            });
        }

        // Botão criar curso
        const createCourseBtn = document.querySelector('.stat-item[onclick*="criarCurso"]');
        if (createCourseBtn) {
            createCourseBtn.onclick = () => {
                window.location.href = '/criar-curso.html';
            };
        }
    }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', async function() {
    // Aguardar um pouco para garantir que o CSS original esteja carregado
    setTimeout(async () => {
        window.professorCourses = new ProfessorCourses();
        await professorCourses.init();
    }, 100);
});