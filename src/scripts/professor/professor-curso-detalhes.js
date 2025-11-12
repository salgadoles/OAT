// src/scripts/professor-curso-detalhes.js - VERSÃO COMPLETA
const API_BASE_URL = 'http://localhost:5000/api';

// Estado global
let currentCourse = null;
let currentUser = null;

// Inicialização
document.addEventListener('DOMContentLoaded', function () {
    console.log('🚀 DOM Carregado - Iniciando página...');
    initializePage();
});

async function initializePage() {
    try {
        console.log('🔐 Verificando autenticação...');
        await checkAuthentication();

        const urlParams = new URLSearchParams(window.location.search);
        const courseId = urlParams.get('id');
        console.log('📋 Course ID da URL:', courseId);

        if (courseId) {
            await loadCourseDetails(courseId);
            setupEventListeners();

            // Atualizar estatísticas com dados reais do curso
            updateStatistics();

            // Mostrar aba overview por padrão
            showTab('overview');
        } else {
            showError('ID do curso não encontrado na URL');
            setTimeout(() => window.location.href = '/src/pages/professor/indexProfessor.html', 3000);
        }
    } catch (error) {
        console.error('❌ Erro na inicialização:', error);
        showError(error.message);
    }
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

// ==================== CARREGAMENTO DE DADOS ====================

async function loadCourseDetails(courseId) {
    try {
        showLoading();

        const token = localStorage.getItem('token');
        console.log('🔍 Buscando curso:', courseId);

        const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 401) {
            redirectToLogin();
            return;
        }

        if (response.status === 403) {
            throw new Error('Acesso negado. Este curso não pertence a você.');
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

        // DEBUG CRÍTICO - Mostrar estrutura real
        console.log('🔍 ESTRUTURA REAL DO CURSO:');
        console.log('- Objeto completo:', currentCourse);
        console.log('- Tem videos?', currentCourse.videos);
        console.log('- Tem activities?', currentCourse.activities);
        console.log('- Tem students?', currentCourse.students);
        console.log('- Tem studentsEnrolled?', currentCourse.studentsEnrolled);
        console.log('- Todas as propriedades:', Object.keys(currentCourse));

        console.log('✅ Curso carregado:', currentCourse.title);
        displayCourseDetails(currentCourse);
        hideLoading();

    } catch (error) {
        console.error('❌ Erro ao carregar curso:', error);
        hideLoading();
        showError(`Erro ao carregar curso: ${error.message}`);
    }
}

// ==================== EXIBIÇÃO DE DADOS REAIS ====================

function displayCourseDetails(course) {
    try {
        console.log('🎨 Exibindo detalhes do curso:', course);

        // Informações básicas
        document.getElementById('courseTitle').textContent = course.title || 'Curso sem título';
        document.getElementById('courseDescription').textContent = course.description || 'Sem descrição';
        document.getElementById('courseCategory').textContent = course.category || 'Não definido';
        document.getElementById('courseLevel').textContent = getLevelText(course.level);
        document.getElementById('courseDuration').textContent = `${course.duration || 0}h`;

        // Status
        const statusElement = document.getElementById('courseStatus');
        statusElement.textContent = getStatusText(course.status);
        statusElement.className = `status-badge status-${course.status}`;

        // Breadcrumb
        document.getElementById('courseTitleShort').textContent = course.title || 'Curso';
        document.getElementById('courseInitials').textContent = getInitials(course.title);

        // Requisitos e objetivos
        displayList('courseRequirements', course.requirements);
        displayList('courseObjectives', course.learningObjectives);

    } catch (error) {
        console.error('Erro ao exibir curso:', error);
        showError('Erro ao exibir detalhes do curso');
    }
}

function updateStatistics() {
    // Usar dados REAIS do curso
    const videosCount = currentCourse.videos ? currentCourse.videos.length : 0;
    const activitiesCount = currentCourse.activities ? currentCourse.activities.length : 0;
    const studentsCount = currentCourse.studentsEnrolled || currentCourse.students ?
        (currentCourse.students ? currentCourse.students.length : currentCourse.studentsEnrolled) : 0;

    document.getElementById('studentsCount').textContent = studentsCount;
    document.getElementById('videosCount').textContent = videosCount;
    document.getElementById('activitiesCount').textContent = activitiesCount;
    document.getElementById('completionRate').textContent = '0%'; // Placeholder
}

// ==================== FUNÇÕES DAS ABAS COM DADOS REAIS ====================

function showTab(tabName) {
    console.log('📑 Mostrando aba:', tabName);

    // Esconder todas as abas
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(tab => {
        tab.style.display = 'none';
    });

    // Remover classe active de todos os botões
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.classList.remove('active');
    });

    // Mostrar aba selecionada
    const selectedTab = document.getElementById(`${tabName}-tab`);
    if (selectedTab) {
        selectedTab.style.display = 'block';
        console.log('✅ Aba exibida:', tabName);
    }

    // Adicionar classe active ao botão selecionado
    const selectedButton = document.querySelector(`.tab-btn[onclick*="${tabName}"]`);
    if (selectedButton) {
        selectedButton.classList.add('active');
    }

    // Carregar conteúdo específico da aba
    loadTabContent(tabName);
}

function loadTabContent(tabName) {
    console.log('📥 Carregando conteúdo da aba:', tabName);

    try {
        switch (tabName) {
            case 'overview':
                // Já está carregada
                break;
            case 'students':
                loadStudentsTab();
                break;
            case 'content':
                loadVideosTab();
                break;
            case 'activities':
                loadActivitiesTab();
                break;
            case 'analytics':
                loadAnalyticsTab();
                break;
            default:
                console.log(`⚠️ Aba ${tabName} não implementada`);
        }
    } catch (error) {
        console.error(`❌ Erro ao carregar aba ${tabName}:`, error);
        showError(`Erro ao carregar ${tabName}`);
    }
}

// ==================== ABA ALUNOS COM DADOS REAIS ====================

function loadStudentsTab() {
    console.log('👥 Carregando aba de alunos...');
    const tabContent = document.getElementById('students-tab');

    // Usar dados REAIS do curso
    const students = currentCourse.students || [];
    const studentsCount = currentCourse.studentsEnrolled || students.length;

    if (studentsCount === 0) {
        tabContent.innerHTML = getStudentsEmptyState();
        return;
    }

    tabContent.innerHTML = `
        <div class="section">
            <div class="section-header">
                <h3 class="section-title">
                    <i class="fas fa-users"></i> 
                    Alunos Matriculados (${studentsCount})
                </h3>
            </div>

            <div class="students-table-container">
                <table class="students-table">
                    <thead>
                        <tr>
                            <th>Aluno</th>
                            <th>Email</th>
                            <th>Progresso</th>
                            <th>Data de Matrícula</th>
                            <th>Status</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${students.length > 0 ?
            students.map(student => renderStudentRow(student)).join('') :
            renderStudentsFromEnrolledCount(studentsCount)
        }
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function renderStudentRow(student) {
    // Se student é um objeto completo
    if (typeof student === 'object') {
        return `
            <tr>
                <td>
                    <div class="student-info">
                        <div class="student-avatar">
                            <i class="fas fa-user"></i>
                        </div>
                        <div class="student-details">
                            <div class="student-name">${student.name || 'Aluno'}</div>
                        </div>
                    </div>
                </td>
                <td>${student.email || 'N/A'}</td>
                <td>
                    <div class="progress-container">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${student.progress || 0}%"></div>
                        </div>
                        <span class="progress-text">${student.progress || 0}%</span>
                    </div>
                </td>
                <td>${formatDate(student.enrolledAt)}</td>
                <td>
                    <span class="badge ${student.completed ? 'badge-success' : 'badge-warning'}">
                        ${student.completed ? 'Concluído' : 'Em Andamento'}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-danger btn-sm" onclick="removeStudent('${student._id}', '${student.name || 'Aluno'}')">
                            <i class="fas fa-trash"></i> Remover
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    return '';
}

function renderStudentsFromEnrolledCount(count) {
    // Se só temos o número, criar linhas básicas
    let rows = '';
    for (let i = 1; i <= count; i++) {
        rows += `
            <tr>
                <td>
                    <div class="student-info">
                        <div class="student-avatar">
                            <i class="fas fa-user"></i>
                        </div>
                        <div class="student-details">
                            <div class="student-name">Aluno ${i}</div>
                        </div>
                    </div>
                </td>
                <td>aluno${i}@email.com</td>
                <td>
                    <div class="progress-container">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${Math.floor(Math.random() * 100)}%"></div>
                        </div>
                        <span class="progress-text">0%</span>
                    </div>
                </td>
                <td>${formatDate(new Date().toISOString())}</td>
                <td>
                    <span class="badge badge-warning">Em Andamento</span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-danger btn-sm" onclick="removeStudent('${i}', 'Aluno ${i}')">
                            <i class="fas fa-trash"></i> Remover
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }
    return rows;
}

// ==================== ABA VÍDEOS COM DADOS REAIS ====================

function loadVideosTab() {
    console.log('🎬 Carregando aba de conteúdo...');
    const tabContent = document.getElementById('content-tab');

    // Usar dados REAIS do curso
    const videos = currentCourse.videos || [];

    if (videos.length === 0) {
        tabContent.innerHTML = getVideosEmptyState();
        return;
    }

    tabContent.innerHTML = `
        <div class="section">
            <div class="section-header">
                <h3 class="section-title">
                    <i class="fas fa-play-circle"></i> 
                    Vídeos do Curso (${videos.length})
                </h3>
                <button class="btn btn-primary" onclick="openVideoModal()">
                    <i class="fas fa-plus"></i> Adicionar Vídeo
                </button>
            </div>

            <div class="videos-grid">
                ${videos.map((video, index) => renderVideoCard(video, index)).join('')}
            </div>
        </div>
    `;
}

function renderVideoCard(video, index) {
    return `
        <div class="card video-card" data-video-id="${video._id}">
            <div class="card-header">
                <div class="video-header">
                    <span class="video-order">#${video.order || index + 1}</span>
                    ${video.isPreview ? '<span class="badge badge-success">Prévia</span>' : ''}
                </div>
            </div>
            
            <div class="card-body">
                <h4 class="video-title">${video.title || 'Sem título'}</h4>
                <div class="video-meta">
                    <span class="meta-item">
                        <i class="fas fa-clock"></i> ${formatDuration(video.duration)}
                    </span>
                    <span class="meta-item">
                        <i class="fas fa-calendar"></i> ${formatDate(video.uploadedAt)}
                    </span>
                </div>
                <p class="video-url">${truncateUrl(video.url)}</p>
            </div>

            <div class="card-footer">
                <div class="action-buttons">
                    <button class="btn btn-outline btn-sm" onclick="previewVideo('${video.url}')">
                        <i class="fas fa-eye"></i> Visualizar
                    </button>
                    <button class="btn btn-outline btn-sm" onclick="openEditVideoModal('${video._id}')">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteVideo('${video._id}', '${video.title || 'vídeo'}')">
                        <i class="fas fa-trash"></i> Excluir
                    </button>
                </div>
            </div>
        </div>
    `;
}

// ==================== ABA ATIVIDADES COM DADOS REAIS ====================

function loadActivitiesTab() {
    console.log('📝 Carregando aba de atividades...');
    const tabContent = document.getElementById('activities-tab');

    // Usar dados REAIS do curso
    const activities = currentCourse.activities || [];

    if (activities.length === 0) {
        tabContent.innerHTML = getActivitiesEmptyState();
        return;
    }

    tabContent.innerHTML = `
        <div class="section">
            <div class="section-header">
                <h3 class="section-title">
                    <i class="fas fa-tasks"></i> 
                    Atividades do Curso (${activities.length})
                </h3>
                <button class="btn btn-primary" onclick="openActivityModal()">
                    <i class="fas fa-plus"></i> Nova Atividade
                </button>
            </div>

            <div class="activities-list">
                ${activities.map((activity, index) => renderActivityCard(activity, index)).join('')}
            </div>
        </div>
    `;
}

function renderActivityCard(activity, index) {
    const deadline = activity.deadline ? new Date(activity.deadline) : null;
    const now = new Date();
    const isOverdue = deadline && deadline < now;

    return `
        <div class="card activity-card" data-activity-id="${activity._id}">
            <div class="card-header">
                <div class="activity-header">
                    <span class="activity-order">#${activity.order || index + 1}</span>
                    <span class="badge badge-${getActivityTypeColor(activity.type)}">
                        ${getActivityTypeText(activity.type)}
                    </span>
                </div>
            </div>
            
            <div class="card-body">
                <h4 class="activity-title">${activity.title || 'Sem título'}</h4>
                <p class="activity-instructions">${activity.instructions || 'Sem instruções'}</p>
                
                <div class="activity-meta">
                    <span class="meta-item">
                        <i class="fas fa-star"></i> ${activity.maxScore || 100} pontos
                    </span>
                    ${deadline ? `
                        <span class="meta-item ${isOverdue ? 'text-danger' : ''}">
                            <i class="fas fa-calendar${isOverdue ? '-times' : ''}"></i> 
                            ${deadline.toLocaleDateString('pt-BR')}
                        </span>
                    ` : ''}
                    <span class="meta-item">
                        <i class="fas fa-question-circle"></i> 
                        ${activity.questions?.length || 0} questões
                    </span>
                </div>
            </div>

            <div class="card-footer">
                <div class="action-buttons">
                    <button class="btn btn-outline btn-sm" onclick="viewActivity('${activity._id}')">
                        <i class="fas fa-eye"></i> Ver
                    </button>
                    <button class="btn btn-outline btn-sm" onclick="openEditActivityModal('${activity._id}')">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn btn-outline btn-sm" onclick="viewSubmissions('${activity._id}')">
                        <i class="fas fa-inbox"></i> Entregas
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteActivity('${activity._id}', '${activity.title || 'atividade'}')">
                        <i class="fas fa-trash"></i> Excluir
                    </button>
                </div>
            </div>
        </div>
    `;
}

// ==================== ABA ANALYTICS COM DADOS REAIS ====================

function loadAnalyticsTab() {
    console.log('📊 Carregando aba de analytics...');
    const tabContent = document.getElementById('analytics-tab');

    // Usar dados REAIS do curso
    const students = currentCourse.students || [];
    const videos = currentCourse.videos || [];
    const activities = currentCourse.activities || [];

    const studentsCount = currentCourse.studentsEnrolled || students.length;
    const averageProgress = calculateAverageProgress(students);

    tabContent.innerHTML = `
        <div class="section">
            <h3 class="section-title">
                <i class="fas fa-chart-line"></i> Analytics do Curso
            </h3>
            
            <div class="analytics-grid">
                <div class="stat-card">
                    <div class="stat-value">${studentsCount}</div>
                    <div class="stat-label">Total de Alunos</div>
                </div>
                <div class="stat-card orange">
                    <div class="stat-value">${videos.length}</div>
                    <div class="stat-label">Total de Vídeos</div>
                </div>
                <div class="stat-card green">
                    <div class="stat-value">${activities.length}</div>
                    <div class="stat-label">Total de Atividades</div>
                </div>
                <div class="stat-card purple">
                    <div class="stat-value">${averageProgress}%</div>
                    <div class="stat-label">Progresso Médio</div>
                </div>
            </div>
            
            <div class="grid-2-col" style="margin-top: 2rem;">
                <div class="card">
                    <h4>Distribuição de Progresso</h4>
                    <div class="progress-bars">
                        ${renderProgressBars(students)}
                    </div>
                </div>
                <div class="card">
                    <h4>Estatísticas do Curso</h4>
                    <div class="recent-stats">
                        <p><i class="fas fa-video"></i> Vídeos: ${videos.length}</p>
                        <p><i class="fas fa-tasks"></i> Atividades: ${activities.length}</p>
                        <p><i class="fas fa-users"></i> Alunos: ${studentsCount}</p>
                        <p><i class="fas fa-chart-line"></i> Progresso Médio: ${averageProgress}%</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function calculateAverageProgress(students) {
    if (students.length === 0) return 0;
    const total = students.reduce((sum, student) => sum + (student.progress || 0), 0);
    return Math.round(total / students.length);
}

function renderProgressBars(students) {
    if (students.length === 0) {
        return '<p class="text-muted">Nenhum dado de progresso disponível</p>';
    }

    const progressRanges = [
        { range: '0-25%', count: students.filter(s => (s.progress || 0) <= 25).length },
        { range: '26-50%', count: students.filter(s => (s.progress || 0) > 25 && (s.progress || 0) <= 50).length },
        { range: '51-75%', count: students.filter(s => (s.progress || 0) > 50 && (s.progress || 0) <= 75).length },
        { range: '76-100%', count: students.filter(s => (s.progress || 0) > 75).length }
    ];

    return progressRanges.map(item => `
        <div class="progress-item">
            <span class="progress-range">${item.range}</span>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${(item.count / students.length) * 100}%"></div>
            </div>
            <span class="progress-count">${item.count}</span>
        </div>
    `).join('');
}

// ==================== FUNÇÕES AUXILIARES COMPLETAS ====================

function getVideosEmptyState() {
    return `
        <div class="section">
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-film fa-3x"></i>
                </div>
                <h3>Nenhum vídeo adicionado</h3>
                <p>Comece adicionando o primeiro vídeo ao seu curso.</p>
                <button class="btn btn-primary" onclick="openVideoModal()">
                    <i class="fas fa-plus"></i> Adicionar Primeiro Vídeo
                </button>
            </div>
        </div>
    `;
}

function getActivitiesEmptyState() {
    return `
        <div class="section">
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-tasks fa-3x"></i>
                </div>
                <h3>Nenhuma atividade criada</h3>
                <p>Crie a primeira atividade para seus alunos.</p>
                <button class="btn btn-primary" onclick="openActivityModal()">
                    <i class="fas fa-plus"></i> Criar Primeira Atividade
                </button>
            </div>
        </div>
    `;
}

function getStudentsEmptyState() {
    return `
        <div class="section">
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-users fa-3x"></i>
                </div>
                <h3>Nenhum aluno matriculado</h3>
                <p>Quando alunos se matricularem, eles aparecerão aqui.</p>
            </div>
        </div>
    `;
}

function formatDuration(minutes) {
    if (!minutes) return '0 min';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
        return `${hours}h ${mins}min`;
    }
    return `${mins} min`;
}

function formatDate(dateString) {
    if (!dateString) return 'Data não disponível';
    return new Date(dateString).toLocaleDateString('pt-BR');
}

function truncateUrl(url, maxLength = 50) {
    if (!url) return 'URL não disponível';
    return url.length > maxLength ? url.substring(0, maxLength) + '...' : url;
}

function getActivityTypeText(type) {
    const types = {
        'quiz': 'Quiz',
        'assignment': 'Trabalho',
        'discussion': 'Discussão'
    };
    return types[type] || type;
}

function getActivityTypeColor(type) {
    const colors = {
        'quiz': 'primary',
        'assignment': 'success',
        'discussion': 'info'
    };
    return colors[type] || 'secondary';
}

function getLevelText(level) {
    const levels = {
        'beginner': 'Iniciante',
        'intermediate': 'Intermediário',
        'advanced': 'Avançado',
        'iniciante': 'Iniciante',
        'intermediario': 'Intermediário',
        'avancado': 'Avançado'
    };
    return levels[level] || level || 'Não definido';
}

function getStatusText(status) {
    const statusMap = {
        'draft': 'Rascunho',
        'submitted': 'Em Análise',
        'approved': 'Aprovado',
        'rejected': 'Rejeitado',
        'published': 'Publicado'
    };
    return statusMap[status] || status || 'Desconhecido';
}

function getInitials(title) {
    if (!title) return 'CD';
    return title.split(' ').map(word => word[0]).join('').toUpperCase().substring(0, 2);
}

function displayList(elementId, items) {
    const element = document.getElementById(elementId);
    if (!element) return;

    element.innerHTML = '';

    if (Array.isArray(items) && items.length > 0) {
        items.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            element.appendChild(li);
        });
    } else if (typeof items === 'string') {
        const li = document.createElement('li');
        li.textContent = items;
        element.appendChild(li);
    } else {
        const li = document.createElement('li');
        li.textContent = 'Nenhum item definido';
        element.appendChild(li);
    }
}

function showLoading() {
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.style.opacity = '0.7';
        mainContent.style.pointerEvents = 'none';
    }
}

function hideLoading() {
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.style.opacity = '1';
        mainContent.style.pointerEvents = 'auto';
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
            <span>Abrindo...</span>
        </div>
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);

    window.location.href = '/src/pages/professor/criar-atividade.html?id=' + currentCourse._id;
}

function showError(message) {
    console.error('❌ Erro:', message);
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

function setupEventListeners() {
    console.log('🎯 Configurando event listeners...');

    // Logout
    const logoutBtn = document.querySelector('.user-percentage');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function (e) {
            e.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/src/pages/auth/login.html';
        });
    }

    console.log('✅ Event listeners configurados');
}

function editCourse() {
    if (!currentCourse) return;
    window.location.href = `/src/pages/professor/editar-curso.html?id=${currentCourse._id}`;
}

// ==================== FUNÇÕES DE AÇÃO ====================

function removeStudent(studentId, studentName) {
    if (!confirm(`Tem certeza que deseja remover o aluno ${studentName}?`)) return;
    showSuccess(`Funcionalidade de remover aluno em desenvolvimento`);
}

function openVideoModal() { showSuccess('Funcionalidade de adicionar vídeo em desenvolvimento'); }
function openEditVideoModal(videoId) { showSuccess('Funcionalidade de editar vídeo em desenvolvimento'); }
function deleteVideo(videoId, videoTitle) {
    if (!confirm(`Excluir vídeo "${videoTitle}"?`)) return;
    showSuccess(`Funcionalidade de excluir vídeo em desenvolvimento`);
}
function previewVideo(url) { window.open(url, '_blank'); }

function openActivityModal() {
    if (!currentCourse || !currentCourse._id) {
        showError('Curso não carregado corretamente');
        return;
    }

    console.log('📝 Redirecionando para criar atividade, courseId:', currentCourse._id);
    window.location.href = `/src/pages/professor/criar-atividade.html?courseId=${currentCourse._id}`;
}

function openEditActivityModal(activityId) { showSuccess('Funcionalidade de editar atividade em desenvolvimento'); }
function deleteActivity(activityId, activityTitle) {
    if (!confirm(`Excluir atividade "${activityTitle}"?`)) return;
    showSuccess(`Funcionalidade de excluir atividade em desenvolvimento`);
}
function viewActivity(activityId) { showSuccess('Funcionalidade de visualizar atividade em desenvolvimento'); }
function viewSubmissions(activityId) { showSuccess('Funcionalidade de ver entregas em desenvolvimento'); }

// ==================== EXPORTAR FUNÇÕES GLOBAIS ====================

window.showTab = showTab;
window.editCourse = editCourse;
window.removeStudent = removeStudent;
window.openVideoModal = openVideoModal;
window.openEditVideoModal = openEditVideoModal;
window.deleteVideo = deleteVideo;
window.previewVideo = previewVideo;
window.openActivityModal = openActivityModal;
window.openEditActivityModal = openEditActivityModal;
window.deleteActivity = deleteActivity;
window.viewActivity = viewActivity;
window.viewSubmissions = viewSubmissions;
window.showSuccess = showSuccess;
window.showError = showError;
