// /src/scripts/load-courses.js
class CourseLoader {
    constructor() {
        this.apiBase = 'http://localhost:5688/api'; // Ajuste a porta conforme seu backend
        this.courses = [];
    }

    // Buscar cursos do backend
    async loadCourses() {
        try {
            console.log('📡 Buscando cursos do backend...');
            
            const response = await fetch(`${this.apiBase}/courses`);
            
            if (!response.ok) {
                throw new Error(`Erro ${response.status}: ${response.statusText}`);
            }
            
            this.courses = await response.json();
            console.log(`✅ ${this.courses.length} cursos carregados:`, this.courses);
            
            this.renderCourses();
            this.updateHeroCarousel();
            
        } catch (error) {
            console.error('💥 Erro ao carregar cursos:', error);
            this.showErrorMessage('Erro ao carregar cursos. Verifique se o backend está rodando.');
        }
    }

    // Renderizar cursos na grid
    renderCourses() {
        const coursesContainer = document.querySelector('.secaoconteudo');
        
        if (!coursesContainer) {
            console.error('❌ Container de cursos não encontrado');
            return;
        }

        // Limpar conteúdo estático atual
        coursesContainer.innerHTML = '';

        if (this.courses.length === 0) {
            coursesContainer.innerHTML = `
                <div class="no-courses">
                    <h3>Nenhum curso disponível</h3>
                    <p>Os cursos aparecerão aqui quando forem publicados.</p>
                </div>
            `;
            return;
        }

        // Criar cards dinamicamente para cada curso
        this.courses.forEach((course, index) => {
            const courseCard = this.createCourseCard(course, index);
            coursesContainer.appendChild(courseCard);
        });

        console.log(`🎨 ${this.courses.length} cursos renderizados`);
    }

    // Criar card individual do curso
    createCourseCard(course, index) {
        const courseElement = document.createElement('section');
        courseElement.className = 'post-curso';
        courseElement.setAttribute('data-course-id', course._id);
        
        // Formatar preço
        const price = course.price > 0 ? `R$ ${course.price.toFixed(2)}` : 'GRATUITO';
        const isFree = course.price === 0;
        
        // Determinar cor baseada no preço
        const priceColor = isFree ? '#00C853' : '#FF6B35';
        
        // Criar rating (placeholder - você pode implementar sistema de avaliação depois)
        const rating = course.rating || 4.5;
        const stars = this.generateStars(rating);
        
        courseElement.innerHTML = `
            <section class="post-imagem">
                <img src="${course.thumbnail || '/public/imagens/imgtestecardscursos.png'}" 
                     alt="${course.title}" 
                     onerror="this.src='/public/imagens/imgtestecardscursos.png'">
                <a href="/src/pages/curso-detalhe.html?id=${course._id}" class="flecha-post">
                    <img src="/public/imagens/Arrow 3.png" alt="Ver curso">
                </a>
            </section>
            <section class="postdobra1">
                <h6>${this.truncateText(course.title, 40)}</h6>
                <p>${this.truncateText(course.description, 80)}</p>
            </section>
            <section class="postdobra2">
                <section class="post-dobra2-esquerda">
                    <p class="avaliacao">SCORE <span>${rating}/5</span></p>
                    ${stars}
                </section>
                <section class="post-dobra2-direita">
                    ${isFree ? 
                        `<p class="promocao" style="color: ${priceColor};">100% OFF<br>/free</p>` : 
                        `<p class="promocao" style="color: ${priceColor};">10% OFF<br>/promo</p>`
                    }
                    <p class="preco" style="color: ${priceColor};"><strong>${isFree ? '0' : course.price.toFixed(0)}</strong>${isFree ? '' : 'USD'}</p>
                </section>
            </section>
        `;

        // Adicionar efeitos de hover
        this.addCardInteractions(courseElement);
        
        return courseElement;
    }

    // Gerar estrelas para avaliação
    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        
        let stars = '';
        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars += '★';
            } else if (i === fullStars && hasHalfStar) {
                stars += '½';
            } else {
                stars += '☆';
            }
        }
        
        return `<div class="stars" style="color: #FFD700; font-size: 12px; margin-top: 5px;">${stars}</div>`;
    }

    // Atualizar carousel hero com curso em destaque
    updateHeroCarousel() {
        if (this.courses.length === 0) return;

        // Encontrar curso com melhor rating ou mais popular
        const featuredCourse = this.courses.reduce((prev, current) => 
            (prev.rating > current.rating) ? prev : current
        );

        // Atualizar elementos do carousel
        const titleElement = document.getElementById('curso-titulo');
        const textElement = document.getElementById('curso-texto');
        const imgElement = document.getElementById('curso-img');

        if (titleElement) {
            titleElement.textContent = featuredCourse.title;
        }
        if (textElement) {
            textElement.textContent = this.truncateText(featuredCourse.description, 120);
        }
        if (imgElement) {
            imgElement.src = featuredCourse.thumbnail || '/public/imagens/default-hero.jpg';
            imgElement.alt = featuredCourse.title;
        }

        console.log('🎯 Curso em destaque:', featuredCourse.title);
    }

    // Adicionar interações aos cards
    addCardInteractions(cardElement) {
        cardElement.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
            this.style.transition = 'all 0.3s ease';
        });

        cardElement.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        });

        // Clique no card (exceto nos links)
        cardElement.addEventListener('click', function(e) {
            if (!e.target.closest('a')) {
                const courseId = this.getAttribute('data-course-id');
                window.location.href = `/src/pages/curso-detalhe.html?id=${courseId}`;
            }
        });
    }

    // Utilitário para truncar texto
    truncateText(text, maxLength) {
        if (!text) return 'Sem descrição';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    // Mostrar mensagem de erro
    showErrorMessage(message) {
        const container = document.querySelector('.secaoconteudo');
        if (container) {
            container.innerHTML = `
                <div class="error-message">
                    <h3>😕 Ops... Algo deu errado</h3>
                    <p>${message}</p>
                    <button onclick="location.reload()" class="btn-retry">Tentar Novamente</button>
                </div>
            `;
        }
    }

    // Filtrar cursos (para implementação futura)
    filterCourses(criteria) {
        // Implementar lógica de filtro aqui
        console.log('Filtrando cursos por:', criteria);
    }
}

// CSS dinâmico para melhorar a aparência
const dynamicStyles = `
    .no-courses, .error-message {
        grid-column: 1 / -1;
        text-align: center;
        padding: 3rem;
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    .no-courses h3, .error-message h3 {
        color: #666;
        margin-bottom: 1rem;
    }
    
    .btn-retry {
        background: #4a90e2;
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 8px;
        cursor: pointer;
        margin-top: 1rem;
    }
    
    .btn-retry:hover {
        background: #357abd;
    }
    
    .post-curso {
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .stars {
        font-size: 12px;
        letter-spacing: 2px;
    }
`;

// Adicionar estilos dinâmicos
const styleSheet = document.createElement('style');
styleSheet.textContent = dynamicStyles;
document.head.appendChild(styleSheet);

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', async function() {
    const courseLoader = new CourseLoader();
    await courseLoader.loadCourses();
    
    // Adicionar funcionalidade de pesquisa
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            // Implementar busca em tempo real aqui
            console.log('Buscando:', searchTerm);
        });
    }
});

// Exportar para uso global
window.CourseLoader = CourseLoader;