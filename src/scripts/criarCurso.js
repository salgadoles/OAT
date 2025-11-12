class CreateCourseForm {
    constructor() {
        this.currentStep = 1;
        this.formData = {
            title: '',
            description: '',
            thumbnail: '',
            price: 0,
            category: '',
            level: 'beginner',
            duration: 10,
            requirements: [],
            learningObjectives: [],
            status: 'draft',
            videos: [],
            activities: []
        };
        console.log('✅ Formulário inicializado com dados:', this.formData);
        this.init();
    }

    init() {
        this.bindEvents();
        this.showStep(1);
        console.log('🎯 Formulário totalmente inicializado');
    }

    bindEvents() {
        // Navegação entre steps
        document.querySelectorAll('.next-step').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const nextStep = parseInt(e.target.dataset.next);
                this.nextStep(nextStep);
            });
        });

        document.querySelectorAll('.prev-step').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const prevStep = parseInt(e.target.dataset.prev);
                this.prevStep(prevStep);
            });
        });

        // Botões de adicionar
        document.getElementById('add-requirement')?.addEventListener('click', () => {
            this.addItem('requirement');
        });

        document.getElementById('add-objective')?.addEventListener('click', () => {
            this.addItem('learningObjective');
        });

        // Enter nos inputs
        document.getElementById('requirement-input')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.addItem('requirement');
            }
        });

        document.getElementById('objective-input')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.addItem('learningObjective');
            }
        });

        // Atualizar formData em tempo real
        this.setupRealTimeUpdates();

        // Submit do formulário
        document.getElementById('createCourseForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitForm();
        });
    }

    setupRealTimeUpdates() {
        // Mapeamento de elementos para propriedades do formData
        const elementsMap = [
            { id: 'title', property: 'title' },
            { id: 'description', property: 'description' },
            { id: 'thumbnail', property: 'thumbnail' },
            { id: 'category', property: 'category' },
            { id: 'level', property: 'level' }
        ];

        elementsMap.forEach(({ id, property }) => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', (e) => {
                    this.formData[property] = e.target.value;
                });
            }
        });

        // Campos numéricos especiais
        document.getElementById('price')?.addEventListener('input', (e) => {
            this.formData.price = parseFloat(e.target.value) || 0;
        });

        document.getElementById('duration')?.addEventListener('input', (e) => {
            this.formData.duration = parseInt(e.target.value) || 10;
        });
    }

    addItem(type) {
        console.log(`➕ Adicionando ${type}...`);
        
        const inputId = type === 'requirement' ? 'requirement-input' : 'objective-input';
        const input = document.getElementById(inputId);
        const value = input?.value.trim();

        if (!value) {
            this.showToast(`Digite um ${type === 'requirement' ? 'requisito' : 'objetivo'}`, 'warning');
            return;
        }

        const arrayKey = type === 'requirement' ? 'requirements' : 'learningObjectives';
        
        if (this.formData[arrayKey].length >= 10) {
            this.showToast(`Máximo de 10 ${type === 'requirement' ? 'requisitos' : 'objetivos'} permitidos`, 'warning');
            return;
        }

        this.formData[arrayKey].push(value);
        console.log(`✅ ${type} adicionado. Novo array:`, this.formData[arrayKey]);

        this.updateItemsList(type);
        input.value = '';
        this.showToast(`${type === 'requirement' ? 'Requisito' : 'Objetivo'} adicionado!`, 'success');
    }

    removeItem(type, index) {
        console.log(`🗑️ Removendo ${type} no índice ${index}`);
        
        const arrayKey = type === 'requirement' ? 'requirements' : 'learningObjectives';
        this.formData[arrayKey].splice(index, 1);
        this.updateItemsList(type);
        this.showToast(`${type === 'requirement' ? 'Requisito' : 'Objetivo'} removido`, 'info');
    }

    updateItemsList(type) {
        const arrayKey = type === 'requirement' ? 'requirements' : 'learningObjectives';
        const listId = type === 'requirement' ? 'requirements-list' : 'objectives-list';
        const list = document.getElementById(listId);

        if (!list) {
            console.error(`❌ Lista ${listId} não encontrada`);
            return;
        }

        const items = this.formData[arrayKey];

        if (items.length === 0) {
            list.innerHTML = `
                <div style="padding: 2rem; text-align: center; color: var(--gray-500);">
                    <i class="fas fa-${type === 'requirement' ? 'list' : 'bullseye'}" style="font-size: 2rem; margin-bottom: 0.5rem; opacity: 0.5;"></i>
                    <div>Nenhum ${type === 'requirement' ? 'requisito' : 'objetivo'} adicionado</div>
                </div>
            `;
            return;
        }

        list.innerHTML = items.map((item, index) => `
            <div class="item-tag">
                <span>${item}</span>
                <button type="button" class="btn-remove" onclick="createCourseForm.removeItem('${type}', ${index})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }

    showStep(step) {
        // Esconder todos os steps
        document.querySelectorAll('.form-step').forEach(stepEl => {
            stepEl.classList.remove('active');
        });

        // Mostrar step atual
        const currentStepEl = document.querySelector(`.form-step[data-step="${step}"]`);
        if (currentStepEl) {
            currentStepEl.classList.add('active');
        }

        // Atualizar progresso
        this.updateProgress(step);

        // Atualizar revisão se for o step 3
        if (step === 3) {
            this.updateReview();
        }

        this.currentStep = step;
        console.log(`📋 Navegando para o passo ${step}`);
    }

    updateProgress(step) {
        // Atualizar steps ativos
        document.querySelectorAll('.step').forEach(stepEl => {
            const stepNumber = parseInt(stepEl.dataset.step);
            stepEl.classList.toggle('active', stepNumber === step);
            stepEl.classList.toggle('completed', stepNumber < step);
        });

        // Atualizar barra de progresso
        const progressFill = document.querySelector('.progress-fill');
        const progressWidth = (step - 1) * 33.33;
        if (progressFill) {
            progressFill.style.width = `${progressWidth}%`;
        }
    }

    nextStep(nextStep) {
        if (this.validateStep(this.currentStep)) {
            this.showStep(nextStep);
        }
    }

    prevStep(prevStep) {
        this.showStep(prevStep);
    }

    validateStep(step) {
        switch (step) {
            case 1:
                const title = document.getElementById('title').value.trim();
                const category = document.getElementById('category').value;
                const level = document.getElementById('level').value;
                const duration = document.getElementById('duration').value;
                const description = document.getElementById('description').value.trim();

                if (!title) {
                    this.showToast('Título do curso é obrigatório', 'error');
                    document.getElementById('title').focus();
                    return false;
                }
                if (!category) {
                    this.showToast('Categoria é obrigatória', 'error');
                    document.getElementById('category').focus();
                    return false;
                }
                if (!level) {
                    this.showToast('Nível é obrigatório', 'error');
                    document.getElementById('level').focus();
                    return false;
                }
                if (!duration || duration < 1) {
                    this.showToast('Duração deve ser pelo menos 1 hora', 'error');
                    document.getElementById('duration').focus();
                    return false;
                }
                if (!description) {
                    this.showToast('Descrição do curso é obrigatória', 'error');
                    document.getElementById('description').focus();
                    return false;
                }

                return true;

            case 3:
                const terms = document.getElementById('terms');
                if (!terms?.checked) {
                    this.showToast('Você deve confirmar que todas as informações estão corretas', 'warning');
                    terms.focus();
                    return false;
                }
                return true;

            default:
                return true;
        }
    }

    updateReview() {
        console.log('📋 Atualizando revisão...');

        // Informações básicas
        document.getElementById('review-title').textContent = this.formData.title || '-';
        document.getElementById('review-category').textContent = this.formData.category || '-';
        document.getElementById('review-level').textContent = this.getLevelText(this.formData.level);
        document.getElementById('review-price').textContent = this.formData.price === 0 ? 'Grátis' : `R$ ${this.formData.price.toFixed(2)}`;
        document.getElementById('review-duration').textContent = `${this.formData.duration} horas`;

        // Descrição
        const descriptionElement = document.getElementById('review-description');
        if (descriptionElement) {
            descriptionElement.textContent = this.formData.description || '-';
        }

        // Requisitos
        const requirementsList = document.getElementById('review-requirements');
        if (requirementsList) {
            if (this.formData.requirements.length > 0) {
                requirementsList.innerHTML = this.formData.requirements.map(req => `<li>${req}</li>`).join('');
            } else {
                requirementsList.innerHTML = '<li>Nenhum requisito definido</li>';
            }
        }

        // Objetivos
        const objectivesList = document.getElementById('review-objectives');
        if (objectivesList) {
            if (this.formData.learningObjectives.length > 0) {
                objectivesList.innerHTML = this.formData.learningObjectives.map(obj => `<li>${obj}</li>`).join('');
            } else {
                objectivesList.innerHTML = '<li>Nenhum objetivo definido</li>';
            }
        }

        console.log('✅ Revisão atualizada');
    }

    getLevelText(level) {
        const levels = {
            'beginner': 'Iniciante',
            'intermediate': 'Intermediário',
            'advanced': 'Avançado'
        };
        return levels[level] || level;
    }

    async submitForm() {
        console.log('🚀 Enviando formulário...');

        if (!this.validateStep(3)) {
            return;
        }

        const submitBtn = document.getElementById('submit-course');
        const originalText = submitBtn.innerHTML;

        // Mostrar loading
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Criando Curso...';
        submitBtn.disabled = true;

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Usuário não autenticado');
            }

            // Preparar dados para envio de acordo com o modelo
            const payload = {
                title: this.formData.title,
                description: this.formData.description,
                thumbnail: this.formData.thumbnail,
                price: this.formData.price,
                category: this.formData.category,
                level: this.formData.level,
                duration: this.formData.duration,
                requirements: this.formData.requirements,
                learningObjectives: this.formData.learningObjectives,
                status: 'draft',
                videos: [],
                activities: []
            };

            console.log('📤 Enviando payload:', payload);

            const response = await fetch('http://localhost:5000/api/courses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            console.log('📥 Resposta recebida - Status:', response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                const errorMessage = errorData?.message || errorData?.errors?.[0] || `Erro ${response.status}: ${response.statusText}`;
                throw new Error(errorMessage);
            }

            const result = await response.json();
            console.log('✅ Curso criado com sucesso:', result);

            this.showToast('🎉 Curso criado com sucesso! Status: Rascunho', 'success');

            // Redirecionar para a página do professor após 2 segundos
            setTimeout(() => {
                window.location.href = '/src/pages/professor/indexProfessor.html';
            }, 2000);

        } catch (error) {
            console.error('💥 Erro ao criar curso:', error);
            this.showToast(`❌ Erro ao criar curso: ${error.message}`, 'error');
        } finally {
            // Restaurar botão
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    showToast(message, type = 'info') {
        // Remover toasts existentes
        document.querySelectorAll('.toast').forEach(toast => toast.remove());

        // Criar toast
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const colors = {
            'success': '#10b981',
            'error': '#ef4444',
            'warning': '#f59e0b',
            'info': '#3b82f6'
        };

        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type] || colors.info};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: var(--radius);
            box-shadow: var(--shadow-lg);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            max-width: 400px;
            font-family: inherit;
        `;

        toast.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <i class="fas fa-${this.getToastIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(toast);

        // Remover após 5 segundos
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 5000);
    }

    getToastIcon(type) {
        const icons = {
            'success': 'check-circle',
            'error': 'exclamation-triangle',
            'warning': 'exclamation-circle',
            'info': 'info-circle'
        };
        return icons[type] || 'info-circle';
    }
}

// Adicionar animações CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .step.completed .step-number {
        background: var(--value) !important;
    }
    
    .step.completed .step-number::after {
        content: '✓';
        position: absolute;
        color: white;
        font-size: 1.2rem;
    }
    
    .fa-spin {
        animation: fa-spin 1s infinite linear;
    }
    
    @keyframes fa-spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    /* Estilos para os itens da lista */
    .item-tag {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem 1rem;
        border-bottom: 1px solid var(--gray-700);
        transition: all 0.3s ease;
    }

    .item-tag:hover {
        background: rgba(255, 255, 255, 0.05);
    }

    .item-tag:last-child {
        border-bottom: none;
    }

    .item-tag span {
        flex: 1;
        color: var(--light);
        font-weight: 500;
    }

    .btn-remove {
        background: transparent;
        color: var(--gray-400);
        border: 1px solid var(--gray-600);
        border-radius: 4px;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 0.8rem;
        transition: all 0.3s ease;
    }

    .btn-remove:hover {
        background: #dc2626;
        color: white;
        border-color: #dc2626;
        transform: scale(1.1);
    }
`;
document.head.appendChild(style);

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM Carregado - Inicializando formulário...');
    window.createCourseForm = new CreateCourseForm();
});