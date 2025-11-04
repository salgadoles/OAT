class AdminDashboard {
    static currentCourseId = null;
    static teachers = [];

    static async initialize() {
        await this.loadTeachers();
        await this.loadCourses();
        this.setupEventListeners();
    }

    static async loadTeachers() {
        try {
            console.log('🔍 Buscando professores...');

            // ✅ USANDO A ROTA REAL
            this.teachers = await API.request('/users?role=teacher');
            console.log(`✅ Encontrados ${this.teachers.length} professores`);

            this.populateTeacherSelects();

        } catch (error) {
            console.error('❌ Erro ao carregar professores:', error);

            // ✅ FALLBACK
            try {
                const allUsers = await API.request('/users');
                this.teachers = allUsers.filter(user => user.role === 'teacher');
                console.log(`✅ Encontrados ${this.teachers.length} professores (fallback)`);
                this.populateTeacherSelects();
            } catch (fallbackError) {
                console.error('❌ Fallback também falhou:', fallbackError);
                this.showMessage('Erro ao carregar lista de professores', 'error');
            }
        }
    }

    static populateTeacherSelects() {
        const instructorSelect = document.getElementById('courseInstructor');
        const filterSelect = document.getElementById('instructorFilter');

        if (instructorSelect) {
            instructorSelect.innerHTML = '<option value="">Selecione um professor</option>';
            this.teachers.forEach(teacher => {
                instructorSelect.innerHTML += `
                    <option value="${teacher._id}">${teacher.name} (${teacher.email})</option>
                `;
            });
        }

        if (filterSelect) {
            filterSelect.innerHTML = '<option value="">Todos os Professores</option>';
            this.teachers.forEach(teacher => {
                filterSelect.innerHTML += `
                    <option value="${teacher._id}">${teacher.name}</option>
                `;
            });
        }
    }

    static async loadCourses() {
        try {
            console.log('🔄 Carregando cursos...');
            this.showLoading(true);

            const courses = await API.getCourses();
            console.log(`✅ ${courses.length} cursos carregados:`, courses.map(c => c.title));

            this.displayCourses(courses);

        } catch (error) {
            console.error('❌ Erro ao carregar cursos:', error);
            this.showMessage('Erro ao carregar cursos: ' + error.message, 'error');
        } finally {
            this.showLoading(false);
            console.log('✅ Carregamento de cursos finalizado');
        }
    }

    static displayCourses(courses) {
        const container = document.getElementById('coursesContainer');
        if (!container) {
            console.error('❌ Container de cursos não encontrado!');
            return;
        }

        console.log(`🎨 Renderizando ${courses.length} cursos...`);

        if (courses.length === 0) {
            container.innerHTML = `
            <div class="no-courses">
                <h3>Nenhum curso encontrado</h3>
                <p>Clique em "Criar Novo Curso" para adicionar o primeiro curso.</p>
            </div>
        `;
            console.log('ℹ️ Nenhum curso para exibir');
            return;
        }

        container.innerHTML = courses.map(course => `
        <div class="course-card-admin">
            <div class="course-header">
                <h3>${course.title}</h3>
                <span class="course-status ${course.isPublished ? 'status-published' : 'status-unpublished'}">
                    ${course.isPublished ? '📢 Publicado' : '📝 Rascunho'}
                </span>
            </div>
            
            <p class="course-description">${course.description}</p>
            
            <div class="course-meta-admin">
                <span><strong>Professor:</strong> ${course.instructor?.name || 'Não definido'}</span>
                <span><strong>Categoria:</strong> ${course.category}</span>
                <span><strong>Nível:</strong> ${this.getLevelText(course.level)}</span>
                <span><strong>Duração:</strong> ${course.duration}h</span>
                <span><strong>Alunos:</strong> ${course.studentsEnrolled || 0} matriculados</span>
                <span><strong>Preço:</strong> ${course.price === 0 ? 'Gratuito' : `R$ ${course.price}`}</span>
            </div>

            <div class="course-actions-admin">
                <button class="btn-small btn-primary" onclick="AdminDashboard.editCourse('${course._id}')">
                    ✏️ Editar
                </button>
                <button class="btn-small ${course.isPublished ? 'btn-secondary' : 'btn-success'}" 
                        onclick="AdminDashboard.togglePublish('${course._id}', ${!course.isPublished})">
                    ${course.isPublished ? '👁️ Ocultar' : '📢 Publicar'}
                </button>
                <button class="btn-small btn-danger" onclick="AdminDashboard.deleteCourse('${course._id}')">
                    🗑️ Excluir
                </button>
            </div>
        </div>
    `).join('');

        console.log('✅ Cursos renderizados com sucesso!');
    }

    static openCreateCourseModal() {
        this.currentCourseId = null;
        this.resetForm();

        const modal = document.getElementById('courseModal');
        const title = document.getElementById('modalTitle');
        const saveButton = document.getElementById('saveCourseButton');

        if (title) title.textContent = 'Criar Novo Curso';
        if (saveButton) saveButton.textContent = 'Criar Curso';
        if (modal) modal.style.display = 'flex';
    }

    static async editCourse(courseId) {
        try {
            this.showLoading(true);
            const course = await API.getCourse(courseId);
            this.currentCourseId = courseId;
            this.populateForm(course);

            const modal = document.getElementById('courseModal');
            const title = document.getElementById('modalTitle');
            const saveButton = document.getElementById('saveCourseButton');

            if (title) title.textContent = 'Editar Curso';
            if (saveButton) saveButton.textContent = 'Salvar Alterações';
            if (modal) modal.style.display = 'flex';

        } catch (error) {
            this.showMessage('Erro ao carregar curso: ' + error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    static populateForm(course) {
        document.getElementById('courseTitle').value = course.title || '';
        document.getElementById('courseDescription').value = course.description || '';
        document.getElementById('courseCategory').value = course.category || '';
        document.getElementById('courseInstructor').value = course.instructor?._id || '';
        document.getElementById('courseLevel').value = course.level || 'beginner';
        document.getElementById('courseDuration').value = course.duration || 0;
        document.getElementById('coursePrice').value = course.price || 0;
        document.getElementById('courseThumbnail').value = course.thumbnail || '';
        document.getElementById('courseRequirements').value = course.requirements?.join('\n') || '';
        document.getElementById('courseObjectives').value = course.learningObjectives?.join('\n') || '';
        document.getElementById('coursePublished').checked = course.isPublished || false;
    }

    static resetForm() {
        document.getElementById('courseForm').reset();
        document.getElementById('coursePublished').checked = false;
    }

    static async forceReloadCourses() {
    console.log('🔄 Forçando recarregamento de cursos...');
    
    // Limpar container
    const container = document.getElementById('coursesContainer');
    if (container) {
        container.innerHTML = '<div class="loading">Atualizando...</div>';
    }
    
    // Aguardar um pouco
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Recarregar
    await this.loadCourses();
}

    static async saveCourse() {
        try {
            console.log('🔄 Iniciando salvamento do curso...');

            const formData = this.getFormData();
            console.log('📋 Dados do formulário:', formData);

            if (!this.validateForm(formData)) {
                console.log('❌ Validação do formulário falhou');
                return;
            }

            const saveButton = document.getElementById('saveCourseButton');
            if (saveButton) {
                saveButton.disabled = true;
                saveButton.textContent = 'Salvando...';
            }

            console.log('📤 Enviando para API...');

            let result;
            if (this.currentCourseId) {
                console.log(`✏️ Editando curso existente: ${this.currentCourseId}`);
                result = await API.updateCourse(this.currentCourseId, formData);
                this.showMessage('✅ Curso atualizado com sucesso!', 'success');
            } else {
                console.log('🆕 Criando novo curso');
                result = await API.createCourse(formData);
                this.showMessage('🎉 Curso criado com sucesso!', 'success');
            }

            console.log('✅ Resposta da API:', result);

            // ✅ FECHAR MODAL PRIMEIRO
            this.closeCourseModal();

            // ✅ AGUARDAR UM POUCO PARA O BANCO PROCESSAR
            await new Promise(resolve => setTimeout(resolve, 500));

            // ✅ RECARREGAR OS CURSOS (com fallback)
            console.log('🔄 Recarregando lista de cursos...');
            await this.loadCourses().catch(async (error) => {
                console.error('❌ Erro no loadCourses, tentando fallback:', error);
                await this.forceReloadCourses();
            });

        } catch (error) {
            console.error('❌ Erro completo ao salvar curso:', error);
            this.showMessage('❌ Erro ao salvar curso: ' + error.message, 'error');
        } finally {
            const saveButton = document.getElementById('saveCourseButton');
            if (saveButton) {
                saveButton.disabled = false;
                saveButton.textContent = this.currentCourseId ? 'Salvar Alterações' : 'Criar Curso';
            }
        }
    }

    static getFormData() {
        console.log('📝 Coletando dados do formulário...');

        try {
            const requirements = document.getElementById('courseRequirements')?.value
                .split('\n')
                .filter(req => req.trim() !== '') || [];

            const objectives = document.getElementById('courseObjectives')?.value
                .split('\n')
                .filter(obj => obj.trim() !== '') || [];

            const formData = {
                title: document.getElementById('courseTitle')?.value || '',
                description: document.getElementById('courseDescription')?.value || '',
                category: document.getElementById('courseCategory')?.value || '',
                instructor: document.getElementById('courseInstructor')?.value || '',
                level: document.getElementById('courseLevel')?.value || 'beginner',
                duration: parseInt(document.getElementById('courseDuration')?.value) || 0,
                price: parseFloat(document.getElementById('coursePrice')?.value) || 0,
                thumbnail: document.getElementById('courseThumbnail')?.value || undefined,
                requirements: requirements,
                learningObjectives: objectives,
                isPublished: document.getElementById('coursePublished')?.checked || false
            };

            console.log('📦 Dados coletados:', formData);
            return formData;

        } catch (error) {
            console.error('❌ Erro ao coletar dados do formulário:', error);
            throw new Error('Erro ao processar dados do formulário');
        }
    }

    static validateForm(data) {
        if (!data.title.trim()) {
            this.showMessage('❌ O título do curso é obrigatório', 'error');
            return false;
        }
        if (!data.description.trim()) {
            this.showMessage('❌ A descrição do curso é obrigatória', 'error');
            return false;
        }
        if (!data.instructor) {
            this.showMessage('❌ Selecione um professor', 'error');
            return false;
        }
        if (data.duration <= 0) {
            this.showMessage('❌ A duração deve ser maior que zero', 'error');
            return false;
        }
        return true;
    }

    static async togglePublish(courseId, publish) {
        try {
            await API.updateCourse(courseId, { isPublished: publish });
            this.showMessage(
                publish ? '✅ Curso publicado com sucesso!' : '✅ Curso ocultado com sucesso!',
                'success'
            );
            await this.loadCourses();
        } catch (error) {
            this.showMessage('❌ Erro ao alterar status: ' + error.message, 'error');
        }
    }

    static async deleteCourse(courseId) {
        const course = await API.getCourse(courseId);

        this.showConfirmModal(
            'Confirmar Exclusão',
            `Tem certeza que deseja excluir o curso "${course.title}"? Esta ação não pode ser desfeita.`,
            async () => {
                try {
                    await API.deleteCourse(courseId);
                    this.showMessage('✅ Curso excluído com sucesso!', 'success');
                    await this.loadCourses();
                } catch (error) {
                    this.showMessage('❌ Erro ao excluir curso: ' + error.message, 'error');
                }
            }
        );
    }

    static closeCourseModal() {
        const modal = document.getElementById('courseModal');
        if (modal) modal.style.display = 'none';
        this.currentCourseId = null;
    }

    static showConfirmModal(title, message, confirmAction) {
        const modal = document.getElementById('confirmModal');
        const titleEl = document.getElementById('confirmTitle');
        const messageEl = document.getElementById('confirmMessage');
        const button = document.getElementById('confirmActionButton');

        if (titleEl) titleEl.textContent = title;
        if (messageEl) messageEl.textContent = message;

        button.onclick = () => {
            confirmAction();
            this.closeConfirmModal();
        };

        if (modal) modal.style.display = 'flex';
    }

    static closeConfirmModal() {
        const modal = document.getElementById('confirmModal');
        if (modal) modal.style.display = 'none';
    }

    static getLevelText(level) {
        const levels = {
            'beginner': 'Iniciante',
            'intermediate': 'Intermediário',
            'advanced': 'Avançado'
        };
        return levels[level] || level;
    }

    static showLoading(show = true) {
        const loading = document.getElementById('loading');
        const container = document.getElementById('coursesContainer');

        if (loading) loading.style.display = show ? 'block' : 'none';
        if (container) container.style.display = show ? 'none' : 'grid';
    }

    static showMessage(message, type = 'info') {
        console.log(`📢 ${type.toUpperCase()}: ${message}`);

        // Tentar usar a função global do app.js
        if (typeof showMessage === 'function') {
            showMessage(message, type);
        } else {
            // Fallback: criar um alerta temporário no admin dashboard
            this.createTempMessage(message, type);
        }
    }

    static createTempMessage(message, type) {
        // Remover mensagem anterior se existir
        const existingMessage = document.getElementById('adminTempMessage');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Criar nova mensagem
        const messageDiv = document.createElement('div');
        messageDiv.id = 'adminTempMessage';
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 5px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        max-width: 400px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;

        // Cores baseadas no tipo
        if (type === 'error') {
            messageDiv.style.background = '#dc3545';
        } else if (type === 'success') {
            messageDiv.style.background = '#28a745';
        } else {
            messageDiv.style.background = '#667eea';
        }

        document.body.appendChild(messageDiv);

        // Auto-remover após 5 segundos
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }

    static setupEventListeners() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (confirm('Tem certeza que deseja sair?')) {
                    Auth.logout();
                }
            });
        }

        // Fechar modal com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeCourseModal();
                this.closeConfirmModal();
            }
        });
    }
}


// Inicializar dashboard do admin
document.addEventListener('DOMContentLoaded', function () {
    if (window.location.pathname.includes('admin-dashboard.html')) {
        AdminDashboard.initialize();
    }
});