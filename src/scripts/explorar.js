import { api } from './api.js';

// Estado da aplicação
let currentPage = 1;
let currentSearch = '';
const itemsPerPage = 6;

// Carrossel de cursos em alta (será preenchido dinamicamente)
let slides = [];

let index = 0;
const tempoSlide = 5;
const titulo = document.getElementById("curso-titulo");
const texto = document.getElementById("curso-texto");
const img = document.getElementById("curso-img");
const container = document.getElementById("progress-container");

function criaBarras() {
  if (!container) return;
  
  container.innerHTML = ''; // Limpa barras existentes
  slides.forEach(() => {
    const item = document.createElement("div");
    item.classList.add("progress-item");
    const inner = document.createElement("div");
    inner.classList.add("progress-inner");
    item.appendChild(inner);
    container.appendChild(item);
  });
}

function iniciarCarrossel() {
  if (!container || !titulo || !texto || !img) return;
  
  criaBarras();
  const barras = document.querySelectorAll(".progress-inner");

  function trocaSlide() {
    if (slides.length === 0) return;
    
    const s = slides[index];

    gsap.to(".overlay-info", { opacity: 0, x: -50, duration: 0.5, ease: "power2.inOut" });
    setTimeout(() => {
      titulo.textContent = s.titulo;
      texto.textContent = s.texto;
      img.src = s.img;
      
      gsap.fromTo(".overlay-info",
        { opacity: 0, x: -50 },
        { opacity: 1, x: 0, duration: 1.2, ease: "power3.out" }
      );

      gsap.fromTo(img,
        { opacity: 0, scale: 1.1, filter: "blur(4px)" },
        { opacity: 1, scale: 1, filter: "blur(0px)", duration: 1.2, ease: "power3.out" }
      );

      barras.forEach((b, i) => {
        gsap.killTweensOf(b);
        gsap.set(b, { width: i < index ? "100%" : "0%" });
      });

      if (barras[index]) {
        gsap.fromTo(barras[index],
          { width: "0%" },
          {
            width: "100%", 
            duration: tempoSlide, 
            ease: "power1.inOut", 
            onComplete: () => {
              gsap.to(barras[index], { 
                scaleY: 1.3, 
                yoyo: true, 
                repeat: 1, 
                duration: 0.3, 
                ease: "power1.inOut" 
              });
            }
          }
        );
      }

      index = (index + 1) % slides.length;
    }, 500);
  }

  if (slides.length > 0) {
    trocaSlide();
    setInterval(trocaSlide, tempoSlide * 1000);
  }
}

document.addEventListener('DOMContentLoaded', async function() {
    console.log('🎯 Inicializando página explorar...');
    
    // Verificar se usuário está logado
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    
    if (!token || !user) {
        console.log('❌ Usuário não logado, redirecionando...');
        window.location.href = '/login';
        return;
    }

    console.log('👤 Usuário logado:', user);

    try {
        // Carregar cursos e atualizar interface
        await loadCursos();
        
        // Configurar busca
        setupBusca();
        
    } catch (error) {
        console.error('💥 Erro ao inicializar página:', error);
    }
});

async function loadCursos() {
    console.log('📚 Carregando cursos...');
    
    const secaoConteudo = document.querySelector('.secaoconteudo');
    
    if (!secaoConteudo) {
        console.log('❌ Seção de conteúdo não encontrada');
        return;
    }

    try {
        // Mostrar loading
        secaoConteudo.innerHTML = `
            <div class="loading-courses" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                <h3>🔄 Carregando cursos...</h3>
                <p>Aguarde enquanto buscamos os cursos disponíveis</p>
            </div>
        `;

        // CORREÇÃO: A API retorna um array direto, não um objeto com propriedade courses
        const cursos = await api.getCourses();
        console.log('📦 Cursos recebidos (ARRAY):', cursos);

        if (!Array.isArray(cursos)) {
            console.error('❌ Formato inválido - esperado array, recebido:', typeof cursos);
            throw new Error('Formato de dados inválido');
        }

        console.log(`🎯 ${cursos.length} cursos encontrados`);

        if (cursos.length > 0) {
            // Filtrar apenas cursos publicados para alunos
            const cursosPublicados = cursos.filter(curso => {
                const isPublished = curso.status === 'published' || curso.isPublished === true;
                console.log(`📋 Curso: ${curso.title} - Status: ${curso.status} - Publicado: ${isPublished}`);
                return isPublished;
            });
            
            console.log(`📢 ${cursosPublicados.length} cursos publicados`);
            
            renderCursos(cursosPublicados, secaoConteudo);
            atualizarCarrossel(cursosPublicados);
        } else {
            secaoConteudo.innerHTML = `
                <div class="no-courses" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                    <h3>📚 Nenhum curso disponível no momento</h3>
                    <p>Volte em breve para ver novos cursos!</p>
                    <button onclick="recarregarCursos()" style="margin-top: 10px; padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        Tentar Novamente
                    </button>
                </div>
            `;
        }

    } catch (error) {
        console.error('💥 Erro ao carregar cursos:', error);
        secaoConteudo.innerHTML = `
            <div class="error-courses" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                <h3>😕 Erro ao carregar cursos</h3>
                <p>${error.message}</p>
                <div style="margin-top: 15px;">
                    <button onclick="recarregarCursos()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; margin: 5px;">
                        Tentar Novamente
                    </button>
                    <button onclick="debugCursos()" style="padding: 10px 20px; background: #28a745; color: white; border: none; border-radius: 5px; cursor: pointer; margin: 5px;">
                        Debug
                    </button>
                </div>
            </div>
        `;
    }
}

function renderCursos(cursos, container) {
    console.log('🎨 Renderizando', cursos.length, 'cursos');
    
    // Limpar conteúdo estático atual
    const postsEstaticos = container.querySelectorAll('.post-curso');
    postsEstaticos.forEach(post => post.remove());
    
    // Adicionar cursos dinâmicos
    cursos.forEach(curso => {
        const postCurso = createPostCurso(curso);
        container.appendChild(postCurso);
    });

    // Se não há cursos, mostrar mensagem
    if (cursos.length === 0) {
        container.innerHTML = `
            <div class="no-courses" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                <h3>📚 Nenhum curso público disponível</h3>
                <p>Os cursos podem estar em revisão ou ainda não publicados.</p>
            </div>
        `;
    }
}

function createPostCurso(curso) {
    const post = document.createElement('section');
    post.className = 'post-curso';
    post.setAttribute('data-curso-id', curso._id);
    
    // Calcular desconto e preço
    const precoOriginal = curso.price || 0;
    const temDesconto = precoOriginal > 0 && curso.discount > 0;
    const desconto = temDesconto ? curso.discount : 0;
    const precoFinal = temDesconto ? precoOriginal * (1 - desconto/100) : precoOriginal;
    
    // Determinar texto do preço
    let textoPreco = 'GRATUITO';
    if (precoFinal > 0) {
        textoPreco = `R$ ${precoFinal.toFixed(2)}`;
    }

    // Tratar dados que podem ser undefined
    const tituloCurso = curso.title || 'Curso sem título';
    const descricaoCurso = curso.description || 'Descrição não disponível';
    const ratingCurso = curso.rating || '5';
    const thumbnailCurso = curso.thumbnail || '/public/imagens/imgtestecardscursos.png';
    
    post.innerHTML = `
        <section class="post-imagem">
            <img src="${thumbnailCurso}" 
                 alt="${tituloCurso}" 
                 onerror="this.src='/public/imagens/imgtestecardscursos.png'">
            <a href="/curso/${curso._id}" class="flecha-post">
                <img src="/public/imagens/Arrow 3.png" alt="Ver curso">
            </a>
        </section>
        <section class="postdobra1">
            <h6>${tituloCurso}</h6>
            <p>${descricaoCurso.substring(0, 60)}...</p>
        </section>
        <section class="postdobra2">
            <section class="post-dobra2-esquerda">
                <p class="avaliacao">SCORE <span>${ratingCurso}/5</span></p>
            </section>
            <section class="post-dobra2-direita">
                ${temDesconto ? 
                    `<p class="promocao">${desconto}% OFF <br> /free</p>` : 
                    `<p class="promocao" style="visibility: hidden;">&nbsp;</p>`
                }
                <p class="preco">
                    <strong>${textoPreco}</strong>
                    ${precoOriginal > 0 && temDesconto ? 
                        `<small style="text-decoration: line-through; color: #999; font-size: 0.8em;">R$ ${precoOriginal.toFixed(2)}</small>` : 
                        ''
                    }
                </p>
            </section>
        </section>
    `;
    
    return post;
}

function atualizarCarrossel(cursos) {
    console.log('🔄 Atualizando carrossel com', cursos.length, 'cursos');
    
    // Selecionar os 4 primeiros cursos para o carrossel
    const cursosCarrossel = cursos.slice(0, 4);
    
    // Atualizar slides do carrossel
    slides = cursosCarrossel.map(curso => ({
        titulo: curso.title || 'Curso sem título',
        texto: (curso.description || 'Descrição do curso').substring(0, 100) + '...',
        img: curso.thumbnail || '/public/imagens/imgtestecardscursos.png',
        link: `/curso/${curso._id}`
    }));
    
    // Se não há cursos suficientes, usar placeholders
    if (slides.length === 0) {
        slides = [
            {
                titulo: "Em breve novos cursos",
                texto: "Estamos preparando conteúdos incríveis para você",
                img: "/public/imagens/imgtestecardscursos.png",
                link: "#"
            }
        ];
    }
    
    // Reiniciar carrossel com os novos slides
    iniciarCarrossel();
}

function setupBusca() {
    const searchInput = document.querySelector('.search-input');
    const btnSearch = document.querySelector('.btnsearch');
    
    if (searchInput && btnSearch) {
        const realizarBusca = () => {
            const termo = searchInput.value.toLowerCase().trim();
            const posts = document.querySelectorAll('.post-curso');
            let encontrados = 0;
            
            posts.forEach(post => {
                const titulo = post.querySelector('h6')?.textContent.toLowerCase() || '';
                const descricao = post.querySelector('p')?.textContent.toLowerCase() || '';
                
                if (titulo.includes(termo) || descricao.includes(termo)) {
                    post.style.display = 'block';
                    encontrados++;
                } else {
                    post.style.display = 'none';
                }
            });
            
            // Mostrar mensagem se não encontrar resultados
            const secaoConteudo = document.querySelector('.secaoconteudo');
            const mensagemBusca = secaoConteudo.querySelector('.no-results');
            
            if (encontrados === 0 && termo !== '') {
                if (!mensagemBusca) {
                    const msg = document.createElement('div');
                    msg.className = 'no-results';
                    msg.style.gridColumn = '1 / -1';
                    msg.style.textAlign = 'center';
                    msg.style.padding = '40px';
                    msg.innerHTML = `
                        <h3>🔍 Nenhum curso encontrado</h3>
                        <p>Tente usar outros termos de busca</p>
                    `;
                    secaoConteudo.appendChild(msg);
                }
            } else if (mensagemBusca) {
                mensagemBusca.remove();
            }
        };
        
        searchInput.addEventListener('input', debounce(realizarBusca, 300));
        btnSearch.addEventListener('click', realizarBusca);
        
        // Buscar ao pressionar Enter
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                realizarBusca();
            }
        });
    }
}

// Função para debounce
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Função de logout
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
}

// Funções globais para debug e recarregamento
window.recarregarCursos = loadCursos;

window.debugCursos = async function() {
    try {
        console.log('🔍 === INICIANDO DEBUG ===');
        
        // Verificar token
        const token = localStorage.getItem('token');
        console.log('🔑 Token no localStorage:', token ? '✅ Presente' : '❌ Ausente');
        
        // Verificar usuário
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        console.log('👤 Usuário no localStorage:', user);
        
        // Testar requisição diretamente
        console.log('🌐 Testando requisição para /courses...');
        const response = await fetch('http://localhost:3000/courses', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('📊 Status da resposta:', response.status);
        console.log('📋 Headers:', Object.fromEntries(response.headers.entries()));
        
        const data = await response.json();
        console.log('📦 Dados recebidos:', data);
        console.log('📊 Tipo dos dados:', typeof data);
        console.log('🔢 É array?', Array.isArray(data));
        
        if (Array.isArray(data)) {
            console.log(`🎯 Número de cursos: ${data.length}`);
            data.forEach((curso, index) => {
                console.log(`📝 Curso ${index + 1}:`, {
                    id: curso._id,
                    title: curso.title,
                    status: curso.status,
                    isPublished: curso.isPublished,
                    price: curso.price
                });
            });
        }
        
    } catch (error) {
        console.error('💥 ERRO NO DEBUG:', error);
    }
};

// Adicione um botão de debug no HTML temporariamente
document.addEventListener('DOMContentLoaded', function() {
    // Adicionar botão de debug se não existir
    if (!document.getElementById('debug-btn')) {
        const debugBtn = document.createElement('button');
        debugBtn.id = 'debug-btn';
        debugBtn.textContent = '🐛 Debug';
        debugBtn.style.position = 'fixed';
        debugBtn.style.bottom = '20px';
        debugBtn.style.right = '20px';
        debugBtn.style.zIndex = '10000';
        debugBtn.style.padding = '10px';
        debugBtn.style.background = '#ff4444';
        debugBtn.style.color = 'white';
        debugBtn.style.border = 'none';
        debugBtn.style.borderRadius = '5px';
        debugBtn.style.cursor = 'pointer';
        debugBtn.onclick = window.debugCursos;
        document.body.appendChild(debugBtn);
    }
});