// src/scripts/professor/criar-atividade.js - VERSÃO CORRIGIDA
const API_BASE_URL = 'http://localhost:5000/api';
let currentCourse = null;
let currentUser = null;

document.addEventListener('DOMContentLoaded', function () {
    console.log('🚀 DOM Carregado - Iniciando página de criar atividade...');
    initializeActivityPage();
});

async function initializeActivityPage() {
    try {
        console.log('🔐 Verificando autenticação...');
        await checkAuthentication();

        const urlParams = new URLSearchParams(window.location.search);
        const courseId = urlParams.get('courseId');

        console.log('📋 Parâmetros da URL:', {
            courseId: courseId,
            allParams: Object.fromEntries(urlParams.entries())
        });

        if (!courseId) {
            showError('ID do curso não encontrado na URL. Parâmetro necessário: courseId');
            console.error('❌ Parâmetros disponíveis:', Object.fromEntries(urlParams.entries()));
            setTimeout(() => window.location.href = '/src/pages/professor/indexProfessor.html', 3000);
            return;
        }

        console.log('📖 Carregando informações do curso:', courseId);
        await loadCourseInfo(courseId);
        setupActivityForm();
        setupFileUploadToggle();

        console.log('✅ Página inicializada com sucesso');

    } catch (error) {
        console.error('❌ Erro na inicialização:', error);
        showError(error.message);
    }
}

async function loadCourseInfo(courseId) {
    try {
        showLoading();

        const token = localStorage.getItem('token');
        console.log('🔍 Buscando curso:', courseId);

        const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('📡 Resposta da API:', response.status, response.statusText);

        if (response.status === 401) {
            redirectToLogin();
            return;
        }

        if (!response.ok) {
            throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }

        const courseData = await response.json();
        console.log('📊 Dados do curso recebidos:', courseData);

        // Ajuste para estrutura de resposta
        currentCourse = courseData.course || courseData.data || courseData;

        if (!currentCourse) {
            throw new Error('Estrutura de dados do curso não reconhecida');
        }

        console.log('✅ Curso carregado:', currentCourse.title);

        // Atualizar UI
        document.getElementById('courseTitleShort').textContent = currentCourse.title;
        document.getElementById('courseInitials').textContent = getInitials(currentCourse.title);
        document.getElementById('currentCourseName').textContent = currentCourse.title;

        // Definir ordem automática baseada nas atividades existentes
        const nextOrder = (currentCourse.activities?.length || 0) + 1;
        document.getElementById('activityOrder').value = nextOrder;

        console.log(` Próxima ordem de atividade: ${nextOrder}`);

    } catch (error) {
        console.error(' Erro ao carregar curso:', error);
        showError('Erro ao carregar informações do curso: ' + error.message);
    } finally {
        hideLoading();
    }
}

function setupActivityForm() {
    const form = document.getElementById('activityForm');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await createActivity();
    });

    // Mostrar/ocultar configurações baseadas no tipo
    document.getElementById('activityType').addEventListener('change', function () {
        toggleFileUploadVisibility(this.value);
    });

    // Auto-gerar ordem se não preenchida
    document.getElementById('activityOrder').addEventListener('blur', function () {
        if (!this.value) {
            const nextOrder = (currentCourse.activities?.length || 0) + 1;
            this.value = nextOrder;
        }
    });
}

function setupFileUploadToggle() {
    const fileUploadCheckbox = document.getElementById('allowFileUpload');
    const fileUploadConfig = document.getElementById('fileUploadConfig');

    if (fileUploadCheckbox && fileUploadConfig) {
        fileUploadCheckbox.addEventListener('change', function () {
            fileUploadConfig.style.display = this.checked ? 'block' : 'none';
        });
    }
}

function toggleFileUploadVisibility(activityType) {
    const fileUploadSection = document.getElementById('fileUploadSection');
    const allowFileUpload = document.getElementById('allowFileUpload');

    if (!fileUploadSection || !allowFileUpload) return;

    // Habilitar upload de arquivos para assignments e projects
    if (activityType === 'assignment' || activityType === 'project') {
        fileUploadSection.style.display = 'block';
        allowFileUpload.checked = true;
        document.getElementById('fileUploadConfig').style.display = 'block';
    } else {
        fileUploadSection.style.display = 'none';
        allowFileUpload.checked = false;
        document.getElementById('fileUploadConfig').style.display = 'none';
    }
}

async function createActivity() {
    try {
        showLoading();

        if (!currentCourse || !currentCourse._id) {
            throw new Error('Curso não carregado corretamente');
        }

        const formData = new FormData(document.getElementById('activityForm'));
        const allowedFileTypes = getSelectedFileTypes();

        const activityData = {
            title: formData.get('title'),
            type: formData.get('type'),
            instructions: formData.get('instructions'),
            description: formData.get('description') || '',
            maxScore: parseInt(formData.get('maxScore')) || 100,
            order: parseInt(formData.get('order')) || 1,
            deadline: formData.get('deadline') || undefined,
            allowFileUpload: formData.get('allowFileUpload') === 'on',
            allowedFileTypes: allowedFileTypes,
            maxFileSize: parseInt(formData.get('maxFileSize')) || 10,
            courseId: currentCourse._id // Incluir courseId explicitamente
        };

        console.log('📤 Enviando dados da atividade:', activityData);

        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/courses/${currentCourse._id}/activities`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(activityData)
        });

        console.log(' Resposta da criação:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(' Erro detalhado:', errorText);
            let errorMessage = `Erro ${response.status}: ${response.statusText}`;

            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.message || errorMessage;
            } catch (e) {
                // Não é JSON, usar texto puro
            }

            throw new Error(errorMessage);
        }

        const result = await response.json();
        console.log(' Atividade criada com sucesso:', result);

        showSuccess('Atividade criada com sucesso!');
        setTimeout(() => {
            window.location.href = `/src/pages/professor/curso-detalhes.html?id=${currentCourse._id}`;
        }, 1500);

    } catch (error) {
        console.error('❌ Erro ao criar atividade:', error);
        showError('Erro ao criar atividade: ' + error.message);
    } finally {
        hideLoading();
    }
}

function getSelectedFileTypes() {
    const checkboxes = document.querySelectorAll('input[name="allowedFileTypes"]:checked');
    const selectedTypes = Array.from(checkboxes).map(cb => cb.value);

    // Mapear tipos genéricos para extensões específicas
    const typeMapping = {
        'pdf': ['pdf'],
        'doc': ['doc', 'docx'],
        'image': ['jpg', 'jpeg', 'png', 'gif', 'bmp'],
        'zip': ['zip', 'rar', '7z'],
        'other': ['*'] // Permite qualquer tipo
    };

    let fileTypes = [];
    selectedTypes.forEach(type => {
        if (typeMapping[type]) {
            fileTypes = fileTypes.concat(typeMapping[type]);
        }
    });

    return fileTypes.length > 0 ? fileTypes : ['pdf', 'doc', 'docx'];
}

// ==================== FUNÇÕES DE AUTENTICAÇÃO ====================

async function checkAuthentication() {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
        redirectToLogin();
        return;
    }

    try {
        currentUser = JSON.parse(userData);

        if (currentUser.role !== 'professor' && currentUser.role !== 'PROFESSOR') {
            showError('Acesso permitido apenas para professores');
            setTimeout(() => window.location.href = '/src/pages/user/index.html', 3000);
            return;
        }

        console.log('✅ Usuário autenticado:', currentUser.name);
    } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        redirectToLogin();
    }
}

function redirectToLogin() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/src/pages/auth/login.html';
}

// ==================== FUNÇÕES AUXILIARES ====================

function getInitials(title) {
    if (!title) return 'CD';
    return title.split(' ').map(word => word[0]).join('').toUpperCase().substring(0, 2);
}

function showLoading() {
    const submitBtn = document.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Criando...';
    }
}

function hideLoading() {
    const submitBtn = document.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-save"></i> Criar Atividade';
    }
}

function showSuccess(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--success);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: var(--radius);
        box-shadow: var(--shadow-lg);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        max-width: 400px;
    `;
    toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        </div>
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function showError(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--danger);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: var(--radius);
        box-shadow: var(--shadow-lg);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        max-width: 400px;
    `;
    toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
            <i class="fas fa-exclamation-triangle"></i>
            <span>${message}</span>
        </div>
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

// ==================== EXPORTAR FUNÇÕES GLOBAIS ====================

window.toggleFileUploadVisibility = toggleFileUploadVisibility;
window.createActivity = createActivity;