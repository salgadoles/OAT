// Modal para cadernos
const modalCaderno = document.getElementById('modalCaderno');
const imagemCadernoAberto = document.getElementById('imagemCadernoAberto');
const fecharModal = document.querySelector('.fechar-modal');
const cardsJornada = document.querySelectorAll('.card-jornada');

// Função para abrir o caderno
function abrirCaderno(card) {
  const status = card.getAttribute('data-status');
  
  // Se estiver bloqueado, não faz nada
  if (status === 'bloqueado') {
    return;
  }
  
  const modulo = card.getAttribute('data-modulo');
  const imagemFechada = card.querySelector('img').src;
  
  // Tenta carregar a imagem aberta
  const imagemAberta = imagemFechada.replace('fechado', 'aberto');
  
  console.log('Abrindo caderno:', { modulo, status, imagemAberta });
  
  // Define a imagem
  imagemCadernoAberto.src = imagemAberta;
  imagemCadernoAberto.alt = `Caderno do Módulo ${modulo} - Aberto`;
  
  // Adiciona fallback para caso a imagem não exista
  imagemCadernoAberto.onerror = function() {
    console.warn('Imagem aberta não encontrada, usando fallback');
    // Pode adicionar um placeholder ou manter a imagem fechada
    imagemCadernoAberto.src = '/public/imagens/placeholder-caderno-aberto.png';
  };
  
  modalCaderno.classList.add('ativo');
  document.body.style.overflow = 'hidden';
}

// Fechar modal
function fecharCaderno() {
  modalCaderno.classList.remove('ativo');
  document.body.style.overflow = '';
  imagemCadernoAberto.src = '';
}

// Event listeners
cardsJornada.forEach(card => {
  card.addEventListener('click', () => abrirCaderno(card));
});

fecharModal.addEventListener('click', fecharCaderno);
modalCaderno.addEventListener('click', (e) => {
  if (e.target === modalCaderno) fecharCaderno();
});

// Tela cheia
const btnTelaCheia = document.getElementById('btnTelaCheia');
const body = document.body;

btnTelaCheia.addEventListener('click', () => {
  const isFullscreen = body.classList.toggle('fullscreen-mode');
  btnTelaCheia.textContent = isFullscreen ? '✕' : '⛶';
});

// Fechar modal com ESC
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modalCaderno.classList.contains('ativo')) {
    fecharCaderno();
  }
});

// Efeito de parallax na estrada
window.addEventListener('scroll', () => {
  const estradaPercurso = document.querySelector('.estrada-percurso');
  const scrollTop = window.scrollY;
  
  if (estradaPercurso) {
    estradaPercurso.style.backgroundPositionY = `${scrollTop * 0.3}px`;
  }
});

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
  console.log('Jornada do aluno inicializada!');
  
  // Classificação automática dos elementos por tipo
  const elementos = document.querySelectorAll('.coluna-lado .elemento');
  
  elementos.forEach(elemento => {
    const img = elemento.querySelector('img');
    const src = img.src.toLowerCase();
    
    // Remove classes existentes
    elemento.classList.remove('pequeno', 'medio', 'grande');
    
    // Classifica por tipo de elemento
    if (src.includes('grama')) {
      elemento.classList.add('pequeno');
    } else if (src.includes('feno')) {
      elemento.classList.add('pequeno');
    } else if (src.includes('cacto') && !src.includes('gordo')) {
      elemento.classList.add('medio');
    } else if (src.includes('cactogordo')) {
      elemento.classList.add('medio');
    } else if (src.includes('arvore')) {
      elemento.classList.add('grande');
    }
  });
});