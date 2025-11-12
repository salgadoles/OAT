// src/scripts/professor/criar-atividade.js - VERSÃO CORRIGIDA
const API_BASE_URL = 'http://localhost:5000/api';

class ActivityCreator {
    constructor() {
        this.courseId = this.getCourseIdFromURL();
        this.token = localStorage.getItem('token');
        this.currentCourse = null;
        
        console.log('🔧 Inicializando ActivityCreator:', {
            courseId: this.courseId,
            hasToken: !!this.token,
            tokenPreview: this.token ? this.token.substring(0, 20) + '...' : 'NO TOKEN'
        });
        
        this.init();
    }

    init() {
        if (!this.checkAuth()) {
            return;
        }

        if (!this.courseId) {
            this.showError('ID do curso não encontrado na URL');
            return;
        }

        this.loadCourseInfo();
        this.setupEventListeners();
    }

    checkAuth() {
        console.log('🔐 Verificando autenticação...');
        
        if (!this.token) {
            console.error('❌ TOKEN NÃO ENCONTRADO');
            this.showError('Sessão expirada. Faça login novamente.');
            setTimeout(() => {
                window.location.href = '/src/pages/user/login.html';
            }, 2000);
            return false;
        }

        try {
            const user = JSON.parse(localStorage.getItem('user'));
            console.log('👤 Usuário:', user);
            
            if (!user || (user.role !== 'professor' && user.role !== 'admin')) {
                this.showError('Acesso permitido apenas para professores');
                return false;
            }
            
            return true;
        } catch (error) {
            console.error('❌ Erro ao verificar usuário:', error);
            this.showError('Erro de autenticação');
            return false;
        }
    }

    getCourseIdFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const courseId = urlParams.get('courseId') || urlParams.get('id');
        
        console.log('🔍 Parâmetros da URL:', {
            courseId: courseId,
            allParams: Object.fromEntries(urlParams)
        });
        
        return courseId;
    }

    async loadCourseInfo() {
        try {
            console.log('📚 Carregando informações do curso...');
            
            const response = await fetch(`${API_BASE_URL}/courses/${this.courseId}`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('📡 Status da resposta:', response.status);

            if (response.status === 401) {
                this.showError('Sessão expirada. Faça login novamente.');
                this.redirectToLogin();
                return;
            }

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Erro ${response.status}: ${errorText}`);
            }

            const courseData = await response.json();
            console.log('✅ Curso carregado:', courseData);

            this.currentCourse = courseData;
            
            // Atualizar interface
            document.getElementById('currentCourseName').textContent = this.currentCourse.title;
            document.getElementById('courseTitleShort').textContent = this.currentCourse.title;

        } catch (error) {
            console.error('❌ Erro ao carregar curso:', error);
            this.showError(`Erro ao carregar curso: ${error.message}`);
        }
    }

    setupEventListeners() {
        const form = document.getElementById('activityForm');
        const allowUploadCheckbox = document.getElementById('allowFileUpload');
        const activityTypeSelect = document.getElementById('activityType');

        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
            console.log('✅ Form listener configurado');
        }

        if (allowUploadCheckbox) {
            allowUploadCheckbox.addEventListener('change', (e) => {
                document.getElementById('fileUploadConfig').style.display = 
                    e.target.checked ? 'block' : 'none';
            });
        }

        if (activityTypeSelect) {
            activityTypeSelect.addEventListener('change', (e) => {
                this.handleActivityTypeChange(e.target.value);
            });
        }
    }

    handleActivityTypeChange(type) {
        const fileUploadSection = document.getElementById('fileUploadSection');
        
        if (type === 'assignment' || type === 'project') {
            fileUploadSection.style.display = 'block';
        } else {
            fileUploadSection.style.display = 'none';
            document.getElementById('allowFileUpload').checked = false;
            document.getElementById('fileUploadConfig').style.display = 'none';
        }
    }

    async handleSubmit(event) {
        event.preventDefault();
        console.log('🚀 Iniciando criação de atividade...');
        
        if (!this.validateForm()) {
            this.showError('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        await this.createActivity();
    }

    validateForm() {
        const requiredFields = [
            'activityTitle',
            'activityType', 
            'activityInstructions'
        ];

        let isValid = true;

        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!field || !field.value.trim()) {
                isValid = false;
                this.highlightError(field);
            } else {
                this.removeError(field);
            }
        });

        return isValid;
    }

    highlightError(field) {
        field.style.borderColor = '#e74c3c';
        field.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    removeError(field) {
        field.style.borderColor = '';
    }

    async createActivity() {
        this.showLoading(true);

        try {
            const formData = this.getFormData();
            console.log('📤 Dados da atividade:', formData);
            console.log('🔑 Token sendo enviado:', this.token ? 'PRESENTE' : 'AUSENTE');

            // ⚠️ USANDO ROTA TEMPORÁRIA
            const response = await fetch(`${API_BASE_URL}/courses/${this.courseId}/create-activity`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            console.log('📡 Status da resposta:', response.status);
            console.log('🔗 URL:', `${API_BASE_URL}/courses/${this.courseId}/create-activity`);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Erro da API:', errorText);
                
                let errorMessage = `Erro ${response.status}`;
                try {
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.message || errorMessage;
                } catch (e) {
                    errorMessage = errorText || errorMessage;
                }
                
                throw new Error(errorMessage);
            }

            const result = await response.json();
            console.log('✅ Resposta da API:', result);

            this.showSuccess('Atividade criada com sucesso!');
            this.redirectToCourse();

        } catch (error) {
            console.error('❌ Erro completo:', error);
            this.showError(`Falha na criação: ${error.message}`);
        } finally {
            this.showLoading(false);
        }
    }

    getFormData() {
        const formData = {
            title: document.getElementById('activityTitle').value.trim(),
            type: document.getElementById('activityType').value,
            instructions: document.getElementById('activityInstructions').value.trim(),
            description: document.getElementById('activityDescription').value.trim() || undefined,
            order: parseInt(document.getElementById('activityOrder').value) || 1,
            maxScore: parseInt(document.getElementById('maxScore').value) || 100,
            deadline: document.getElementById('deadline').value || undefined
        };

        console.log('📦 FormData final:', formData);
        return formData;
    }

    showLoading(show) {
        const submitBtn = document.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = show;
            submitBtn.innerHTML = show ? 
                '<i class="fas fa-spinner fa-spin"></i> Criando...' : 
                '<i class="fas fa-save"></i> Criar Atividade';
        }
    }

    showSuccess(message) {
        this.showMessage(message, 'success');
        
        // Redirecionar após sucesso
        setTimeout(() => {
            this.redirectToCourse();
        }, 2000);
    }

    showError(message) {
        this.showMessage(message, 'error');
    }

    showMessage(message, type) {
        // Remover mensagens anteriores
        const existingMessages = document.querySelectorAll('.custom-message');
        existingMessages.forEach(msg => msg.remove());

        const messageDiv = document.createElement('div');
        messageDiv.className = `custom-message ${type}`;
        messageDiv.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check' : 'exclamation-triangle'}"></i>
            ${message}
        `;

        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            background: ${type === 'success' ? '#27ae60' : '#e74c3c'};
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideInRight 0.3s ease-out;
            display: flex;
            align-items: center;
            gap: 10px;
            max-width: 400px;
        `;

        document.body.appendChild(messageDiv);

        if (type === 'success') {
            setTimeout(() => {
                messageDiv.remove();
            }, 3000);
        }
    }

    redirectToCourse() {
        window.location.href = `/src/pages/professor/curso-detalhes.html?id=${this.courseId}`;
    }

    redirectToLogin() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/src/pages/auth/login.html';
    }
}

// Adicionar estilos para animação
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
`;
document.head.appendChild(style);

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM Carregado - Iniciando ActivityCreator');
    console.log('📍 URL completa:', window.location.href);
    
    window.activityCreator = new ActivityCreator();
});

// Função global para teste manual
window.testAuth = function() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    console.log('🔐 DEBUG DE AUTENTICAÇÃO:');
    console.log('📌 Token:', token);
    console.log('👤 User:', user);
    console.log('📍 URL:', window.location.href);
    
    return { token, user };
};