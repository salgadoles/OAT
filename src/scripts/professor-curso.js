// src/scripts/professor-curso.js - VERSÃO CORRIGIDA
const API_BASE_URL = 'http://localhost:5000/api';

async function fetchProfessorCourses() {
    try {
        console.log('🚀 Buscando cursos do professor...');

        const token = localStorage.getItem('token');
        if (!token) {
            console.error('❌ Token não encontrado');
            return;
        }

        const response = await fetch(`${API_BASE_URL}/courses`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Erro ${response.status}`);
        }

        const courses = await response.json();
        console.log('✅ Cursos recebidos:', courses.length);

        // Substitui os cursos estáticos pelos cursos reais
        replaceCoursesInGrid(courses);

    } catch (error) {
        console.error('Erro:', error);
    }
}

function replaceCoursesInGrid(courses) {
    const coursesGrid = document.querySelector('.classes-grid');
    if (!coursesGrid) {
        console.error('❌ Grid de cursos não encontrado');
        return;
    }

    console.log('🎨 Substituindo cursos estáticos por cursos reais...');

    // Limpa o grid mantendo a estrutura
    coursesGrid.innerHTML = '';

    // Adiciona cada curso real mantendo o mesmo estilo visual
    courses.forEach((course, index) => {
        const courseCard = createCourseCard(course, index);
        coursesGrid.appendChild(courseCard);
    });

    console.log('✅ Cursos reais carregados no grid');
}

function createCourseCard(course, index) {
    const card = document.createElement('div');
    card.className = 'class-card';

    // Determina o texto da tag baseado no status
    let tagText = 'TUR'; // Padrão
    let tagClass = '';

    switch (course.status) {
        case 'draft':
            tagText = 'RASCUNHO';
            tagClass = 'draft';
            break;
        case 'published':
            tagText = 'PUBLICADO';
            tagClass = 'published';
            break;
        case 'submitted':
            tagText = 'EM ANÁLISE';
            tagClass = 'submitted';
            break;
        case 'approved':
            tagText = 'APROVADO';
            tagClass = 'approved';
            break;
        case 'rejected':
            tagText = 'REJEITADO';
            tagClass = 'rejected';
            break;
    }

    card.innerHTML = `
        <div class="class-header">
            <span class="class-tag ${tagClass}">${tagText}</span>
            <div class="class-actions">
                <i class="fas fa-users class-icon" title="${course.studentsEnrolled || 0} alunos"></i>
                <i class="fas fa-share class-icon" title="Compartilhar"></i>
            </div>
        </div>
        <div class="class-title">${course.title}</div>
    `;

    card.addEventListener('click', function () {
        openCourseDetails(course._id);
    });

    return card;
}

function openCourseDetails(courseId) {
    window.location.href = `/professor/curso-detalhes?id=${courseId}`;
}

// Inicialização quando a página carrega
document.addEventListener('DOMContentLoaded', function () {
    console.log('📄 Página do professor carregada');
    console.log('📍 Buscando cursos reais do banco...');
    fetchProfessorCourses();
});

// Funções dos filtros
function filterCourses(filter) {
    console.log('Filtrando por:', filter);
}

function createNewCourse() {
    window.location.href = '/src/pages/course/create.html';
}

var professorname = localStorage.getItem("professorname");
if(professorname){
    document.getElementById("professorname").innerText = `Bem vindo de volta, ${professorname}.`;
}