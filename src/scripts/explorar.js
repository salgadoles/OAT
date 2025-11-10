import { api } from './api.js';
// Configuração da API
const API_URL = 'http://localhost:3000/cursos';

// Estado da aplicação
let currentPage = 1;
let currentSearch = '';
const itemsPerPage = 6;

// Carrossel de cursos em alta
const slides = [
  {titulo:"Curso de Python Avançado", texto:"Automação, APIs e IA", img:"https://d335luupugsy2.cloudfront.net/cms/files/47031/1757823897/$of7p3idlna", link:"#"},
  {titulo:"Design UI/UX", texto:"Crie interfaces modernas", img:"https://d335luupugsy2.cloudfront.net/cms/files/47031/1757823897/$of7p3idlna", link:"#"},
  {titulo:"Machine Learning", texto:"Modelos inteligentes e predição", img:"https://d335luupugsy2.cloudfront.net/cms/files/47031/1757823897/$of7p3idlna", link:"#"},
  {titulo:"Marketing Digital", texto:"Estratégias e crescimento online", img:"https://d335luupugsy2.cloudfront.net/cms/files/47031/1757823897/$of7p3idlna", link:"#"}
];

let index = 0;
const tempoSlide = 5;
const titulo = document.getElementById("curso-titulo");
const texto  = document.getElementById("curso-texto");
const img    = document.getElementById("curso-img");
const container = document.getElementById("progress-container");

function criaBarras(){
  slides.forEach(()=> {
    const item = document.createElement("div");
    item.classList.add("progress-item");
    const inner = document.createElement("div");
    inner.classList.add("progress-inner");
    item.appendChild(inner);
    container.appendChild(item);
  });
}

if (container) {
  criaBarras();
  const barras = document.querySelectorAll(".progress-inner");

  function trocaSlide(){
    const s = slides[index];

    gsap.to(".overlay-info", {opacity:0, x:-50, duration:0.5, ease:"power2.inOut"});
    setTimeout(()=>{
      titulo.textContent = s.titulo;
      texto.textContent  = s.texto;
      img.src = s.img;
      
      gsap.fromTo(".overlay-info",
        {opacity:0, x:-50},
        {opacity:1, x:0, duration:1.2, ease:"power3.out"}
      );

      gsap.fromTo(img,
        {opacity:0, scale:1.1, filter:"blur(4px)"},
        {opacity:1, scale:1, filter:"blur(0px)", duration:1.2, ease:"power3.out"}
      );

      barras.forEach((b,i)=>{
        gsap.killTweensOf(b);
        gsap.set(b,{width: i<index ? "100%" : "0%"});
      });

      gsap.fromTo(barras[index],
        {width:"0%"},
        {width:"100%", duration:tempoSlide, ease:"power1.inOut", onComplete:()=> {
          gsap.to(barras[index], {scaleY:1.3, yoyo:true, repeat:1, duration:0.3, ease:"power1.inOut"});
        }}
      );

      index = (index + 1) % slides.length;
    },500);
  }

  trocaSlide();
  setInterval(trocaSlide, tempoSlide*1000);
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
        // Carregar cursos
        await loadCursos();
        
        // Atualizar carrossel com curso em destaque
        await updateCarrossel();
        
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
        const resultado = await api.getCourses();
        console.log('📦 Cursos recebidos:', resultado);

        if (resultado.courses && resultado.cursos.length > 0) {
            renderCursos(resultado.cursos, secaoConteudo);
        } else {
            secaoConteudo.innerHTML = `
                <div class="no-courses" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                    <h3>📚 Nenhum curso disponível no momento</h3>
                    <p>Volte em breve para ver novos cursos!</p>
                </div>
            `;
        }

    } catch (error) {
        console.error('💥 Erro ao carregar cursos:', error);
        secaoConteudo.innerHTML = `
            <div class="error-courses" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                <h3>😕 Erro ao carregar cursos</h3>
                <p>Tente recarregar a página.</p>
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
}

function createPostCurso(curso) {
    const post = document.createElement('section');
    post.className = 'post-curso';
    
    // Calcular desconto e preço (lógica de exemplo)
    const precoOriginal = curso.price || 0;
    const temDesconto = precoOriginal > 0 && Math.random() > 0.5; // Exemplo aleatório
    const desconto = temDesconto ? Math.floor(Math.random() * 70) + 10 : 0; // 10-80%
    const precoFinal = temDesconto ? precoOriginal * (1 - desconto/100) : precoOriginal;
    
    post.innerHTML = `
        <section class="post-imagem">
            <img src="${curso.thumbnail || '/public/imagens/imgtestecardscursos.png'}" 
                 alt="${curso.title}" 
                 onerror="this.src='/public/imagens/imgtestecardscursos.png'">
            <a href="/curso/${curso._id}" class="flecha-post">
                <img src="/public/imagens/Arrow 3.png" alt="Ver curso">
            </a>
        </section>
        <section class="postdobra1">
            <h6>${curso.title}</h6>
            <p>${curso.description?.substring(0, 60) || 'Descrição do curso'}...</p>
        </section>
        <section class="postdobra2">
            <section class="post-dobra2-esquerda">
                <p class="avaliacao">SCORE <span>${curso.rating || '5'}/5</span></p>
            </section>
            <section class="post-dobra2-direita">
                ${temDesconto ? 
                    `<p class="promocao">${desconto}% OFF <br> /free</p>` : 
                    `<p class="promocao" style="visibility: hidden;">&nbsp;</p>`
                }
                <p class="preco">
                    <strong>${precoFinal > 0 ? 'R$ ' + precoFinal.toFixed(2) : 'GRATUITO'}</strong>
                    ${precoOriginal > 0 && temDesconto ? 
                        `<small style="text-decoration: line-through; color: #999; font-size: 0.8em;">R$ ${precoOriginal}</small>` : 
                        ''
                    }
                </p>
            </section>
        </section>
    `;
    
    return post;
}

async function updateCarrossel() {
    try {
        const resultado = await api.getCourses();
        const cursos = resultado.courses || [];
        
        if (cursos.length > 0) {
            // Pegar o primeiro curso como destaque (ou lógica mais elaborada)
            const cursoDestaque = cursos[0];
            
            // Atualizar carrossel
            const cursoImg = document.getElementById('curso-img');
            const cursoTitulo = document.getElementById('curso-titulo');
            const cursoTexto = document.getElementById('curso-texto');
            
            if (cursoImg) {
                cursoImg.src = cursoDestaque.thumbnail || '/public/imagens/imgtestecardscursos.png';
                cursoImg.alt = cursoDestaque.title;
            }
            
            if (cursoTitulo) {
                cursoTitulo.textContent = cursoDestaque.title;
            }
            
            if (cursoTexto) {
                cursoTexto.textContent = cursoDestaque.description?.substring(0, 100) + '...' || 'Confira este curso incrível!';
            }
        }
    } catch (error) {
        console.error('💥 Erro ao atualizar carrossel:', error);
    }
}

// Configurar busca
function setupBusca() {
    const searchInput = document.querySelector('.search-input');
    const btnSearch = document.querySelector('.btnsearch');
    
    if (searchInput && btnSearch) {
        const realizarBusca = () => {
            const termo = searchInput.value.toLowerCase();
            const posts = document.querySelectorAll('.post-curso');
            
            posts.forEach(post => {
                const titulo = post.querySelector('h6')?.textContent.toLowerCase() || '';
                const descricao = post.querySelector('p')?.textContent.toLowerCase() || '';
                
                if (titulo.includes(termo) || descricao.includes(termo)) {
                    post.style.display = 'block';
                } else {
                    post.style.display = 'none';
                }
            });
        };
        
        searchInput.addEventListener('input', debounce(realizarBusca, 300));
        btnSearch.addEventListener('click', realizarBusca);
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

// Inicializar busca quando o DOM carregar
document.addEventListener('DOMContentLoaded', setupBusca);


// // Função para buscar cursos da API
// async function buscarCursos(search = '', page = 1, limit = itemsPerPage) {
//   try {
//     const params = new URLSearchParams({
//       page: page.toString(),
//       limit: limit.toString()
//     });
    
//     if (search) {
//       params.append('search', search);
//     }
    
//     const response = await fetch(`${API_URL}?${params}`);
//     const data = await response.json();
    
//     return data;
//   } catch (error) {
//     console.error('Erro ao buscar cursos:', error);
//     return { cursos: [], total: 0 };
//   }
// }

// // Função para renderizar os cursos na página
// function renderizarCursos(cursos) {
//   const secaoConteudo = document.querySelector('.secaoconteudo');
  
//   if (!secaoConteudo) {
//     console.error('Seção de conteúdo não encontrada');
//     return;
//   }
  
//   // Limpar cursos existentes (exceto o carrossel)
//   const cursosAntigos = secaoConteudo.querySelectorAll('.post-curso');
//   cursosAntigos.forEach(curso => curso.remove());
  
//   // Renderizar novos cursos
//   cursos.forEach(curso => {
//     const postCurso = document.createElement('section');
//     postCurso.className = 'post-curso';
    
//     const skillsText = curso.skills.map(skill => skill.nome).join(', ');
    
//     postCurso.innerHTML = `
//       <section class="post-imagem">
//         <img src="https://d335luupugsy2.cloudfront.net/cms/files/47031/1757823897/$of7p3idlna" alt="${curso.titulo}">
//         <a href="#" class="flecha-post"><img src="/public/imagens/Arrow 3.png" alt=""></a>
//       </section>
//       <section class="postdobra1">
//         <h6>${curso.titulo}</h6>
//         <p>${curso.descricao}</p>
//         <p class="skills-info"><strong>Skills:</strong> ${skillsText}</p>
//       </section>
//       <section class="postdobra2">
//         <section class="post-dobra2-esquerda">
//           <p class="instituicao">${curso.instituicao}</p>
//           <p class="duracao">${curso.duracao}</p>
//         </section>
//         <section class="post-dobra2-direita">
//           <p class="nivel">${curso.nivel}</p>
//         </section>
//       </section>
//     `;
    
//     secaoConteudo.appendChild(postCurso);
//   });
  
//   // Adicionar paginação
//   renderizarPaginacao();
// }

// // Função para renderizar a paginação
// function renderizarPaginacao() {
//   const secaoConteudo = document.querySelector('.secaoconteudo');
  
//   // Remover paginação existente
//   const paginacaoAntiga = secaoConteudo.querySelector('.paginacao');
//   if (paginacaoAntiga) {
//     paginacaoAntiga.remove();
//   }
  
//   // Criar nova paginação
//   const paginacao = document.createElement('div');
//   paginacao.className = 'paginacao';
  
//   const btnAnterior = document.createElement('button');
//   btnAnterior.textContent = 'Anterior';
//   btnAnterior.disabled = currentPage === 1;
//   btnAnterior.addEventListener('click', () => {
//     if (currentPage > 1) {
//       currentPage--;
//       carregarCursos();
//     }
//   });
  
//   const pageInfo = document.createElement('span');
//   pageInfo.textContent = `Página ${currentPage}`;
//   pageInfo.className = 'page-info';
  
//   const btnProximo = document.createElement('button');
//   btnProximo.textContent = 'Próximo';
//   btnProximo.addEventListener('click', () => {
//     currentPage++;
//     carregarCursos();
//   });
  
//   paginacao.appendChild(btnAnterior);
//   paginacao.appendChild(pageInfo);
//   paginacao.appendChild(btnProximo);
  
//   secaoConteudo.appendChild(paginacao);
// }

// // Função para carregar cursos
// async function carregarCursos() {
//   const { cursos, total } = await buscarCursos(currentSearch, currentPage, itemsPerPage);
//   renderizarCursos(cursos);
// }

// // Sidebar de filtros
// document.addEventListener('DOMContentLoaded', () => {
//   const btnSearch = document.querySelector('.btnsearch'); 
//   const sidebar = document.querySelector('.sidebar-filtro');
//   const fechar = document.querySelector('.fechar');
//   const barradepesquisa = document.querySelector('section[barradepesquisa] input');
//   const btnProcurar = document.querySelector('.btn-procurar');

//   if (!btnSearch || !sidebar) {
//     console.warn('Elementos da sidebar não encontrados');
//     return;
//   }

//   function abrirSidebar(e) {
//     if (e) e.preventDefault();
//     sidebar.classList.add('ativo', 'open');
//     document.body.classList.add('sidebar-aberta');
//   }

//   function fecharSidebar() {
//     sidebar.classList.remove('ativo', 'open');
//     document.body.classList.remove('sidebar-aberta');
//   }

//   btnSearch.addEventListener('click', abrirSidebar);

//   if (fechar) fechar.addEventListener('click', fecharSidebar);

//   document.addEventListener('click', (evt) => {
//     const alvo = evt.target;
//     const aberto = sidebar.classList.contains('ativo') || sidebar.classList.contains('open');
//     if (!aberto) return;
//     if (!sidebar.contains(alvo) && !btnSearch.contains(alvo)) {
//       fecharSidebar();
//     }
//   });

//   document.addEventListener('keydown', (evt) => {
//     if (evt.key === 'Escape') fecharSidebar();
//   });

//   // Busca ao clicar no botão procurar
//   if (btnProcurar) {
//     btnProcurar.addEventListener('click', () => {
//       if (barradepesquisa) {
//         currentSearch = barradepesquisa.value;
//         currentPage = 1;
//         carregarCursos();
//         fecharSidebar();
//       }
//     });
//   }

//   // Busca ao pressionar Enter na barra de pesquisa
//   if (barradepesquisa) {
//     barradepesquisa.addEventListener('keypress', (e) => {
//       if (e.key === 'Enter') {
//         currentSearch = barradepesquisa.value;
//         currentPage = 1;
//         carregarCursos();
//       }
//     });
//   }

//   // Carregar cursos iniciais
//   carregarCursos();
// });

