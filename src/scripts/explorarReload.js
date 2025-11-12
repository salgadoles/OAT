// /src/scripts/explorar-courses-simple.js
class ExplorarCourses {
    constructor() {
        this.apiBase = 'http://localhost:5000/api';
        this.courses = [];
    }

    async init() {
        console.log('🚀 Inicializando ExplorarCourses...');
        await this.loadAllCourses();
    }

    async loadAllCourses() {
        try {
            console.log('📡 Buscando cursos publicados...');
            
            const token = localStorage.getItem('token');
            const headers = {
                'Content-Type': 'application/json'
            };
            
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            
            const response = await fetch(`${this.apiBase}/courses`, {
                method: 'GET',
                headers: headers
            });
            
            console.log('📥 Status:', response.status);
            
            if (!response.ok) {
                throw new Error(`Erro ${response.status}: ${response.statusText}`);
            }
            
            const allCourses = await response.json();
            console.log('📦 Cursos recebidos:', allCourses);
            
            // Filtrar apenas cursos publicados
            this.courses = allCourses.filter(course => 
                course.status === 'published' && course.isPublished === true
            );
            
            console.log(`✅ ${this.courses.length} cursos públicos carregados`);
            
            this.renderCourses();
            
        } catch (error) {
            console.error('💥 Erro:', error);
            this.showError(error.message);
        }
    }

    renderCourses() {
        const container = document.querySelector('.secaoconteudo');
        
        if (!container) {
            console.error('❌ Container .secaoconteudo não encontrado');
            return;
        }

        console.log('🎨 Renderizando cursos...');

        // Limpar conteúdo estático existente
        container.innerHTML = '';

        if (this.courses.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; background: var(--card); border-radius: 10px;">
                    <h3 style="color: var(--value); margin-bottom: 1rem;">📚 Nenhum curso disponível</h3>
                    <p style="color: var(--gray-600);">Os cursos aparecerão aqui quando forem publicados.</p>
                </div>
            `;
            return;
        }

        // Renderizar cada curso
        this.courses.forEach((course) => {
            const post = this.createCoursePost(course);
            container.appendChild(post);
        });

        console.log(`🎨 ${this.courses.length} cursos renderizados!`);
    }

    createCoursePost(course) {
        const post = document.createElement('section');
        post.className = 'post-curso';
        
        // Dados do curso seguindo o model ICourse
        const title = course.title || 'Curso sem título';
        const description = course.description || 'Descrição não disponível';
        const price = course.price || 0;
        const thumbnail = course.thumbnail || '/public/imagens/imgtestecardscursos.png';
        const instructor = course.instructor?.name || 'Instrutor';
        const rating = course.rating || 0;
        const students = course.studentsEnrolled || 0;

        post.innerHTML = `
            <section class="post-imagem">
                <img src="${thumbnail}" alt="${title}" 
                     onerror="this.src='/public/imagens/imgtestecardscursos.png'"
                     style="width: 100%; height: 180px; object-fit: cover;">
                <a href="/src/pages/user/curso-detalhe.html?id=${course._id}" class="flecha-post">
                    <img src="/public/imagens/Arrow 3.png" alt="Ver curso">
                </a>
            </section>
            <section class="postdobra1">
                <h6>${title}</h6>
                <p>${description.length > 100 ? description.substring(0, 100) + '...' : description}</p>
                <div style="font-size: 0.8rem; color: var(--gray-600); margin-top: 0.5rem;">
                    <div><strong>Instrutor:</strong> ${instructor}</div>
                    <div><strong>Categoria:</strong> ${course.category || 'Geral'}</div>
                </div>
            </section>
            <section class="postdobra2">
                <section class="post-dobra2-esquerda">
                    <p class="avaliacao">SCORE <span>${rating > 0 ? rating.toFixed(1) : 'N/A'}/5</span></p>
                    <small style="font-size: 0.7rem; color: var(--gray-600);">${students} alunos</small>
                </section>
                <section class="post-dobra2-direita">
                    ${price === 0 ? `
                        <p class="promocao" style="color: var(--success);">GRATUITO<br>/free</p>
                    ` : `
                        <p class="promocao" style="color: var(--warning);">EM OFERTA<br>/promo</p>
                    `}
                    <p class="preco" style="color: ${price === 0 ? 'var(--success)' : 'var(--value)'};">
                        <strong>${price === 0 ? 'Grátis' : `R$ ${price}`}</strong>
                    </p>
                </section>
            </section>
        `;

        return post;
    }

    showError(message) {
        const container = document.querySelector('.secaoconteudo');
        if (container) {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                    <div style="background: var(--card); border: 1px solid var(--gray-200); padding: 2rem; border-radius: 10px;">
                        <h3 style="color: var(--value); margin-bottom: 1rem;">⚠️ Erro ao Carregar Cursos</h3>
                        <p style="color: var(--gray-600); margin-bottom: 1.5rem;">${message}</p>
                        <button onclick="explorarCourses.loadAllCourses()" 
                                style="padding: 10px 20px; background: var(--primary); color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: 500;">
                            🔄 Tentar Novamente
                        </button>
                    </div>
                </div>
            `;
        }
    }
}

// Inicializar
document.addEventListener('DOMContentLoaded', async function() {
    window.explorarCourses = new ExplorarCourses();
    await explorarCourses.init();
});

// Função de logout global
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/src/pages/auth/login.html';
}