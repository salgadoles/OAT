class ExplorarCourses {
    constructor() {
        this.apiBase = 'http://localhost:5000/api';
        this.courses = [];
        this.filteredCourses = [];
        this.currentFilters = {
            category: '',
            search: '',
            minRating: 0
        };
    }

    // Inicializar
    async init() {
        console.log('🚀 Inicializando ExplorarCourses...');
        await this.loadAllCourses();
        this.setupEventListeners();
        this.setupFilters();
    }

    // Carregar todos os cursos publicados
    async loadAllCourses() {
        try {
            console.log('📡 Buscando cursos da API...');
            
            const response = await fetch(`${this.apiBase}/courses`);
            
            console.log('📥 Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`Erro ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('📦 Dados recebidos:', data);
            
            // Verificar se data é um array
            if (!Array.isArray(data)) {
                console.error('❌ Dados não são um array:', typeof data);
                this.courses = [];
            } else {
                // Filtrar cursos publicados - critério mais flexível
                this.courses = data.filter(course => {
                    // Verificar diferentes formas de identificar cursos publicados
                    const isPublished = 
                        course.status === 'published' || 
                        course.isPublished === true ||
                        course.status === 'approved' || // Incluir aprovados também
                        !course.status; // Se não tem status, considerar publicado
                    
                    console.log(`📋 "${course.title}" - Status: ${course.status}, isPublished: ${course.isPublished}, Incluir: ${isPublished}`);
                    return isPublished;
                });
            }

            this.filteredCourses = [...this.courses];
            
            console.log(`✅ ${this.courses.length} cursos públicos carregados`);
            
            this.renderCourses();
            this.updateHeroCarousel();
            
        } catch (error) {
            console.error('💥 Erro ao carregar cursos:', error);
            this.showErrorMessage(`Erro: ${error.message}`);
        }
    }

    // Renderizar cursos mantendo SEU ESTILO ORIGINAL
    renderCourses() {
        const coursesContainer = document.querySelector('.secaoconteudo');
        
        if (!coursesContainer) {
            console.error('❌ Container .secaoconteudo não encontrado');
            return;
        }

        console.log('🎨 Renderizando cursos...');

        // Limpar conteúdo estático atual
        coursesContainer.innerHTML = '';

        if (this.filteredCourses.length === 0) {
            console.log('📭 Nenhum curso para renderizar');
            coursesContainer.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                    <div style="background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <i class="fas fa-search" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
                        <h3 style="color: #333; margin-bottom: 1rem;">Nenhum curso disponível</h3>
                        <p style="color: #666;">Verifique se existem cursos publicados no sistema.</p>
                        <button onclick="debugCoursesAPI()" 
                                style="background: #17a2b8; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer; margin: 0.25rem;">
                            <i class="fas fa-bug"></i> Debug API
                        </button>
                    </div>
                </div>
            `;
            return;
        }

        // Criar posts de curso dinamicamente NO SEU ESTILO
        this.filteredCourses.forEach((course) => {
            const coursePost = this.createCoursePost(course);
            coursesContainer.appendChild(coursePost);
        });

        console.log(`🎨 ${this.filteredCourses.length} cursos renderizados`);
    }

    // Criar post no SEU ESTILO ORIGINAL
    createCoursePost(course) {
        const postElement = document.createElement('section');
        postElement.className = 'post-curso';
        
        // Dados do curso com fallbacks
        const title = course.title || 'Curso Sem Título';
        const description = course.description || 'Descrição não disponível';
        const price = course.price > 0 ? course.price : 0;
        const isFree = price === 0;
        const thumbnail = course.thumbnail || '/public/imagens/imgtestecardscursos.png';
        const instructorName = course.instructor?.name || 'Instrutor';
        
        // Usar SEU HTML ORIGINAL com dados dinâmicos
        postElement.innerHTML = `
            <section class="post-imagem">
                <img src="${thumbnail}" alt="${title}">
                <a href="/src/pages/curso-detalhe.html?id=${course._id}" class="flecha-post">
                    <img src="/public/imagens/Arrow 3.png" alt="Ver curso">
                </a>
            </section>
            <section class="postdobra1">
                <h6>${this.truncateText(title, 40)}</h6>
                <p>${this.truncateText(description, 80)}</p>
            </section>
            <section class="postdobra2">
                <section class="post-dobra2-esquerda">
                    <p class="avaliacao">SCORE <span>5/5</span></p>
                </section>
                <section class="post-dobra2-direita">
                    <p class="promocao">90% OFF <br>/free</p>
                    <p class="preco"><strong>${price}</strong>USD</p>
                </section>
            </section>
        `;

        // Adicionar interações
        this.addPostInteractions(postElement, course);
        
        return postElement;
    }

    // Atualizar carousel hero
    updateHeroCarousel() {
        if (this.courses.length === 0) return;

        // Usar primeiro curso como destaque
        const featuredCourse = this.courses[0];

        // Atualizar elementos do carousel
        const titleElement = document.getElementById('curso-titulo');
        const textElement = document.getElementById('curso-texto');
        const imgElement = document.getElementById('curso-img');

        if (titleElement) {
            titleElement.textContent = featuredCourse.title || 'Curso em Destaque';
        }
        if (textElement) {
            textElement.textContent = this.truncateText(featuredCourse.description || 'Descrição do curso em destaque', 120);
        }
        if (imgElement && featuredCourse.thumbnail) {
            imgElement.src = featuredCourse.thumbnail;
            imgElement.alt = featuredCourse.title;
        }
    }

    // Configurar event listeners
    setupEventListeners() {
        // Pesquisa
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.currentFilters.search = e.target.value;
                this.applyFilters();
            });
        }

        // Botão procurar
        const searchBtn = document.querySelector('.btn-procurar');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.applyFilters();
            });
        }
    }

    // Configurar filtros (simplificado)
    setupFilters() {
        console.log('⚙️ Configurando filtros básicos...');
    }

    // Aplicar filtros
    applyFilters() {
        if (!this.currentFilters.search) {
            this.filteredCourses = [...this.courses];
        } else {
            const searchTerm = this.currentFilters.search.toLowerCase();
            this.filteredCourses = this.courses.filter(course => 
                course.title.toLowerCase().includes(searchTerm) ||
                course.description.toLowerCase().includes(searchTerm)
            );
        }
        this.renderCourses();
    }

    // Adicionar interações
    addPostInteractions(postElement, course) {
        postElement.addEventListener('click', function(e) {
            if (!e.target.closest('a')) {
                window.location.href = `/src/pages/curso-detalhe.html?id=${course._id}`;
            }
        });
    }

    // Utilitário para truncar texto
    truncateText(text, maxLength) {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    // Mostrar mensagem de erro
    showErrorMessage(message) {
        const container = document.querySelector('.secaoconteudo');
        if (container) {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                    <div style="background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: #dc3545; margin-bottom: 1rem;"></i>
                        <h3 style="color: #333; margin-bottom: 1rem;">Erro</h3>
                        <p style="color: #666; margin-bottom: 1.5rem;">${message}</p>
                        <button onclick="explorarCourses.loadAllCourses()" 
                                style="background: #28a745; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer;">
                            Tentar Novamente
                        </button>
                    </div>
                </div>
            `;
        }
    }
}

// Função de debug global
window.debugCoursesAPI = async function() {
    console.log('🔍 Debugando API de cursos...');
    
    try {
        const response = await fetch('http://localhost:5000/api/courses');
        console.log('📊 Status:', response.status);
        
        const data = await response.json();
        console.log('📦 Dados completos:', data);
        console.log('🔢 Tipo de dados:', typeof data);
        console.log('🔢 É array?:', Array.isArray(data));
        
        if (Array.isArray(data)) {
            console.log('📋 Número de cursos:', data.length);
            data.forEach((course, index) => {
                console.log(`🎯 Curso ${index + 1}:`, {
                    id: course._id,
                    title: course.title,
                    status: course.status,
                    isPublished: course.isPublished,
                    instructor: course.instructor
                });
            });
        } else {
            console.log('❌ Dados não são um array');
            console.log('📋 Estrutura dos dados:', data);
        }
        
    } catch (error) {
        console.error('❌ Erro no debug:', error);
    }
};

// Inicializar
document.addEventListener('DOMContentLoaded', async function() {
    window.explorarCourses = new ExplorarCourses();
    await explorarCourses.init();
});