// Seleciona todos os cards
const cardContainers = document.querySelectorAll('.cardpecasprincipal');
const cardPecas = document.querySelectorAll('.cardpecas');

cardContainers.forEach((cardContainer, index) => {
  const infoIcon = cardContainer.querySelector('.info-icon');
  const cardContent = cardContainer.querySelector('.card-content');
  const cardPeca = cardPecas[index];

  function toggleExpand() {
    const isExpanded = cardContent.classList.toggle('expanded');
    cardPeca.classList.toggle('expanded', isExpanded);
    
    // Remove a classe expanded de todos os outros cards
    cardPecas.forEach((otherCard, otherIndex) => {
      if (otherIndex !== index) {
        otherCard.classList.remove('expanded');
        otherCard.querySelector('.card-content')?.classList.remove('expanded');
      }
    });

    cardContent.style.height = isExpanded ? 'min(70vw, 280px)' : '88%';
  }

  infoIcon.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleExpand();
  });

  cardContainer.addEventListener('click', toggleExpand);

  cardContainer.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleExpand();
    }
  });

  cardContainer.style.willChange = 'transform';
  if (cardContent) {
    cardContent.style.willChange = 'height';
  }
});

// Fecha o card expandido ao clicar fora
document.addEventListener('click', (e) => {
  if (!e.target.closest('.cardpecasprincipal')) {
    cardPecas.forEach(cardPeca => {
      cardPeca.classList.remove('expanded');
      const cardContent = cardPeca.querySelector('.card-content');
      if (cardContent) {
        cardContent.classList.remove('expanded');
        cardContent.style.height = '88%';
      }
    });
  }
});