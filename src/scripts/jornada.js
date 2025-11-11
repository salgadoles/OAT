const modalCaderno = document.getElementById('modalCaderno');
const imagemCadernoAberto = document.getElementById('imagemCadernoAberto');
const fecharModal = document.querySelector('.fechar-modal');
const cardsJornada = document.querySelectorAll('.card-jornada');

function abrirCaderno(card) {
  const status = card.getAttribute('data-status');
  
  if (status === 'bloqueado') {
    return;
  }
  
  const modulo = card.getAttribute('data-modulo');
  const imagemFechada = card.querySelector('img').src;
  
  const imagemAberta = imagemFechada.replace('fechado', 'aberto');
  
  console.log('Abrindo caderno:', { modulo, status, imagemAberta });
  
  imagemCadernoAberto.src = imagemAberta;
  imagemCadernoAberto.alt = `Caderno do Módulo ${modulo} - Aberto`;
  
  imagemCadernoAberto.onerror = function() {
    console.warn('Imagem aberta não encontrada, usando fallback');
    imagemCadernoAberto.src = '/public/imagens/placeholder-caderno-aberto.png';
  };
  
  modalCaderno.classList.add('ativo');
  document.body.style.overflow = 'hidden';
}

function fecharCaderno() {
  modalCaderno.classList.remove('ativo');
  document.body.style.overflow = '';
  imagemCadernoAberto.src = '';
}

cardsJornada.forEach(card => {
  card.addEventListener('click', () => abrirCaderno(card));
});

fecharModal.addEventListener('click', fecharCaderno);
modalCaderno.addEventListener('click', (e) => {
  if (e.target === modalCaderno) fecharCaderno();
});

const btnTelaCheia = document.getElementById('btnTelaCheia');
const body = document.body;

btnTelaCheia.addEventListener('click', () => {
  const isFullscreen = body.classList.toggle('fullscreen-mode');
  btnTelaCheia.textContent = isFullscreen ? '✕' : '⛶';
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modalCaderno.classList.contains('ativo')) {
    fecharCaderno();
  }
});

window.addEventListener('scroll', () => {
  const estradaPercurso = document.querySelector('.estrada-percurso');
  const scrollTop = window.scrollY;
  
  if (estradaPercurso) {
    estradaPercurso.style.backgroundPositionY = `${scrollTop * 0.3}px`;
  }
});

document.addEventListener('DOMContentLoaded', function() {
  console.log('Jornada do aluno inicializada!');
  
  const elementos = document.querySelectorAll('.coluna-lado .elemento');
  
  elementos.forEach(elemento => {
    const img = elemento.querySelector('img');
    const src = img.src.toLowerCase();
    
    elemento.classList.remove('pequeno', 'medio', 'grande');
    
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