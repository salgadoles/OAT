/* script.js
 - Arquitetura simples:
   * "api" fornece Promises que simulam chamada a um backend.
   * ui.* contém funções de renderização e navegação.
   * event listeners para interação.
*/

// ---------- Simulação de API / Camada de dados ----------
const api = (function () {
    // dados de amostra (troque por fetch('/api/courses') etc)
    const courses = [
        {
            id: 'c1',
            title: 'Turma 01 | Curso Ninjas do Excel',
            description: 'Aprenda Excel do básico ao avançado.',
            banner: null
        },
        {
            id: 'c2',
            title: 'Turma 02 | Introdução a Dados',
            description: 'Fundamentos de análise e visualização.',
            banner: null
        },
        {
            id: 'c3',
            title: 'Turma 03 | Introdução a Dados',
            description: 'Fundamentos de análise e visualização.',
            banner: null
        }
    ];

    

    const activities = {
        c1: [
            { id: 'a1', title: 'Realizar Primeiro PROCv', deadline: '2025-09-15T12:00:00' },
            { id: 'a2', title: 'Exercício Fórmulas', deadline: '2025-09-23T23:59:00' }
        ],
        c2: [
            { id: 'a3', title: 'Atividade Inicial', deadline: '2025-10-01T23:59:00' }
        ]
    };

    const submissions = {
        a1: [
            { id: 's1', student: 'Maria Silva', email: 'maria@ex.com', status: 'Entregue', file: 'Trabalho.html', content: '<p>Conteúdo do trabalho da Maria</p>', grade: null },
            { id: 's2', student: 'João Souza', email: 'joao@ex.com', status: 'Não Entregue', file: null, content: '', grade: null },
            { id: 's3', student: 'Ana Costa', email: 'ana@ex.com', status: 'Entregue', file: 'resposta.pdf', content: '<p>link para arquivo</p>', grade: 8.5 }
        ],
        a2: [
            { id: 's4', student: 'Pedro', email: 'p@ex.com', status: 'Entregue', file: 'ex1.xlsx', content: '', grade: null }
        ],
        a3: []
    };

    // Simula latência
    const wait = (ms = 300) => new Promise(r => setTimeout(r, ms));

    return {
        listCourses: async () => { await wait(); return courses.slice(); },
        listActivities: async (courseId) => { await wait(); return (activities[courseId] || []).slice(); },
        listSubmissions: async (activityId) => { await wait(); return (submissions[activityId] || []).slice(); },
        getSubmission: async (activityId, submissionId) => { await wait(); return (submissions[activityId] || []).find(s => s.id === submissionId) || null; },

        // salvar nota (em app simula update)
        saveGrade: async (activityId, submissionId, grade) => {
            await wait(200);
            const arr = submissions[activityId] || [];
            const item = arr.find(s => s.id === submissionId);
            if (item) item.grade = grade;
            return item || null;
        }
    };
})();

// ---------- UI / RENDER ----------
const ui = (function () {
    // páginas
    const pages = {
        dashboard: document.getElementById('page-dashboard'),
        course: document.getElementById('page-course'),
        activity: document.getElementById('page-activity')
    };

    const state = {
        currentCourse: null,
        currentActivity: null
    };

    // helpers
    const el = id => document.getElementById(id);
    
    async function renderDashboard() {
        // show page
        var cont = 1;
        showPage('dashboard');
        const grid = el('courses-grid');
        grid.innerHTML = '<em>Carregando cursos...</em>';
        const courses = await api.listCourses();
        grid.innerHTML = '';
        courses.forEach(c => {
            const card = document.createElement('article');
            card.className = 'course-card';
            card.innerHTML = `
        <div class="course-icon">T${cont}</div>
        <div class="course-info">
          <h4>${escapeHtml(c.title)}</h4>
          <p class="muted">${escapeHtml(c.description)}</p>
        </div>
      `;
      cont++;
            
            card.addEventListener('click', () => openCourse(c));
            grid.appendChild(card);
        });
    }

    async function openCourse(course) {
        state.currentCourse = course;
        // show page
        showPage('course');
        el('course-title').textContent = course.title;
        el('course-desc').textContent = course.description;
        const list = el('activities-list');
        list.innerHTML = '<em>Carregando atividades...</em>';
        const activities = await api.listActivities(course.id);
        list.innerHTML = '';
        if (activities.length === 0) list.innerHTML = '<p class="muted">Nenhuma atividade.</p>';
        activities.forEach(a => {
            const item = document.createElement('div');
            item.className = 'activity-item';
            item.innerHTML = `
        <div class="activity-left">
          <div class="activity-avatar">T01</div>
          <div>
            <div style="font-weight:700">${escapeHtml(a.title)}</div>
            <div class="muted">Prazo: ${formatDate(a.deadline)}</div>
          </div>
        </div>
        <div class="activity-actions">
          <button class="small-btn" data-activity-id="${a.id}">Ver entregas</button>
        </div>
      `;
            item.querySelector('.small-btn').addEventListener('click', () => openActivity(a));
            list.appendChild(item);
        });
    }

    async function openActivity(activity) {
        state.currentActivity = activity;
        showPage('activity');
        el('activity-title').textContent = activity.title;
        el('activity-deadline').textContent = 'Prazo até ' + formatDate(activity.deadline);
        const table = el('submissions-table');
        table.innerHTML = '<div style="padding:14px">Carregando entregas...</div>';
        const submissions = await api.listSubmissions(activity.id);
        table.innerHTML = '';
        if (submissions.length === 0) {
            table.innerHTML = '<div style="padding:16px" class="muted">Nenhuma entrega ainda.</div>';
            return;
        }
        submissions.forEach(s => {
            const row = document.createElement('div');
            row.className = 'submission-row';
            row.innerHTML = `
        <div class="col user"><strong>${escapeHtml(s.student)}</strong></div>
        <div class="col email muted">${escapeHtml(s.email)}</div>
        <div class="col status">${escapeHtml(s.status)} ${s.grade ? `• Nota: ${s.grade}` : ''}</div>
        <div class="col actions">
          <button class="small-btn view-btn" data-id="${s.id}">Visualizar</button>
        </div>
      `;
            row.querySelector('.view-btn').addEventListener('click', () => openSubmission(s.id));
            table.appendChild(row);
        });
    }

    // Modal
    async function openSubmission(submissionId) {
        const activityId = state.currentActivity.id;
        const s = await api.getSubmission(activityId, submissionId);
        if (!s) return alert('Entrega não encontrada');
        const modal = el('modal');
        el('modal-student').textContent = `Entrega de: ${s.student}`;
        el('modal-email').textContent = s.email;
        el('modal-body').innerHTML = s.content || (s.file ? `<p>Arquivo: ${escapeHtml(s.file)}</p>` : '<p class="muted">Sem conteúdo.</p>');
        el('grade-input').value = s.grade === null ? '' : s.grade;
        modal.classList.remove('hidden');
        modal.dataset.activityId = activityId;
        modal.dataset.submissionId = submissionId;
        modal.setAttribute('aria-hidden', 'false');
    }

    function closeModal() {
        const modal = el('modal');
        modal.classList.add('hidden');
        modal.removeAttribute('aria-hidden');
    }

    // navigation helper
    function showPage(name) {
        Object.keys(pages).forEach(k => pages[k].classList.remove('active'));
        if (name === 'dashboard') pages.dashboard.classList.add('active');
        if (name === 'course') pages.course.classList.add('active');
        if (name === 'activity') pages.activity.classList.add('active');
    }

    // expose
    return {
        renderDashboard, openCourse, openActivity, openSubmission, closeModal, state
    };
})();

// ---------- Utils & Events ----------
function formatDate(iso) {
    try {
        const d = new Date(iso);
        return d.toLocaleString();
    } catch (e) {
        return iso;
    }
}
function escapeHtml(str = '') {
    return (str + '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

// event wiring
document.addEventListener('DOMContentLoaded', async () => {
    // initial render
    await ui.renderDashboard();

    // nav
    document.getElementById('nav-turmas').addEventListener('click', ui.renderDashboard);
    document.getElementById('back-to-dashboard').addEventListener('click', () => ui.renderDashboard());
    document.getElementById('back-to-course').addEventListener('click', () => {
        // reopen the course page for the selected course
        if (ui.state.currentCourse) ui.openCourse(ui.state.currentCourse);
        else ui.renderDashboard();
    });

    // modal close
    document.getElementById('modal-close').addEventListener('click', ui.closeModal);
    document.getElementById('modal').addEventListener('click', (e) => {
        if (e.target.id === 'modal') ui.closeModal();
    });

    // save grade
    document.getElementById('save-grade').addEventListener('click', async () => {
        const modal = document.getElementById('modal');
        const aid = modal.dataset.activityId;
        const sid = modal.dataset.submissionId;
        const val = parseFloat(document.getElementById('grade-input').value);
        if (isNaN(val)) { alert('Insira uma nota válida'); return; }
        await api.saveGrade(aid, sid, val);
        ui.closeModal();
        // refresh submissions list
        if (ui.state.currentActivity) ui.openActivity(ui.state.currentActivity);
    });

    // create course (demo)
    document.getElementById('btn-create-course').addEventListener('click', () => {
        alert('Botão criar curso clicado. Integre com seu backend para criar cursos.');
    });
});
