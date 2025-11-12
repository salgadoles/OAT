// src/scripts/professor/criar-video.js
const API_BASE_URL = 'http://localhost:5000/api';
let currentCourse = null;
let currentUser = null;

document.addEventListener('DOMContentLoaded', function() {
    initializeVideoPage();
});

async function initializeVideoPage() {
    try {
        await checkAuthentication();
        
        const urlParams = new URLSearchParams(window.location.search);
        const courseId = urlParams.get('courseId');
        
        if (!courseId) {
            showError('ID do curso não encontrado');
            setTimeout(() => window.location.href = '/src/pages/professor/indexProfessor.html', 3000);
            return;
        }

        await loadCourseInfo(courseId);
        setupVideoForm();
        
    } catch (error) {
        console.error('Erro na inicialização:', error);
        showError(error.message);
    }
}

async function loadCourseInfo(courseId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error('Erro ao carregar curso');

        const courseData = await response.json();
        currentCourse = courseData.course || courseData.data || courseData;
        
        // Atualizar UI
        document.getElementById('courseTitleShort').textContent = currentCourse.title;
        document.getElementById('courseInitials').textContent = getInitials(currentCourse.title);
        
        // Definir ordem automática
        const nextOrder = (currentCourse.videos?.length || 0) + 1;
        document.getElementById('videoOrder').value = nextOrder;

    } catch (error) {
        console.error('Erro ao carregar curso:', error);
        showError('Erro ao carregar informações do curso');
    }
}

function setupVideoForm() {
    const form = document.getElementById('videoForm');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await createVideo();
    });
}

async function createVideo() {
    try {
        showLoading();
        
        const formData = new FormData(document.getElementById('videoForm'));
        const videoData = {
            title: formData.get('title'),
            description: formData.get('description'),
            url: formData.get('url'),
            duration: parseInt(formData.get('duration')),
            order: parseInt(formData.get('order')),
            thumbnail: formData.get('thumbnail') || undefined,
            isPreview: formData.get('isPreview') === 'on',
            isProcessed: formData.get('isProcessed') === 'on'
        };

        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/courses/${currentCourse._id}/videos`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(videoData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao criar vídeo');
        }

        showSuccess('Vídeo criado com sucesso!');
        setTimeout(() => {
            window.location.href = `/src/pages/professor/curso-detalhes.html?id=${currentCourse._id}`;
        }, 1500);

    } catch (error) {
        console.error('Erro ao criar vídeo:', error);
        showError('Erro ao criar vídeo: ' + error.message);
    } finally {
        hideLoading();
    }
}

// Funções auxiliares (mesmas do arquivo anterior)
async function checkAuthentication() {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
        redirectToLogin();
        return;
    }

    currentUser = JSON.parse(userData);
    
    if (currentUser.role !== 'professor' && currentUser.role !== 'PROFESSOR') {
        showError('Acesso permitido apenas para professores');
        setTimeout(() => window.location.href = '/src/pages/user/index.html', 3000);
        return;
    }
}

function redirectToLogin() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/src/pages/auth/login.html';
}

function getInitials(title) {
    if (!title) return 'CD';
    return title.split(' ').map(word => word[0]).join('').toUpperCase().substring(0, 2);
}

function showLoading() {
    const submitBtn = document.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
    }
}

function hideLoading() {
    const submitBtn = document.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-save"></i> Salvar Vídeo';
    }
}

function showSuccess(message) {
    // Implementação igual à anterior
}

function showError(message) {
    // Implementação igual à anterior
}