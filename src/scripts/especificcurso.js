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

const imagens = [
  "/public/imagens/WhatsApp Image 2025-10-21 at 07.41.18.jpeg",
  "/public/imagens/WhatsApp Image 2025-10-21 at 07.41.39.jpeg",
  "/public/imagens/WhatsApp Image 2025-10-21 at 07.41.56.jpeg"
];

let index = 0;
const imgEl = document.querySelector(".imagem-rotativa img");

if (imgEl) {
  setInterval(() => {
    index = (index + 1) % imagens.length;
    imgEl.classList.remove("img-ativa");
    setTimeout(() => {
      imgEl.src = imagens[index];
      imgEl.classList.add("img-ativa");
    }, );
  }, 500);
}

  (function monitorSplineLogo() {
    let tried = false;

    function tryRemoveLogo() {
      const viewer = document.querySelector("spline-viewer");
      if (!viewer) {
        requestAnimationFrame(tryRemoveLogo);
        return;
      }

      const shadowRoot = viewer.shadowRoot;
      if (!shadowRoot) {
        requestAnimationFrame(tryRemoveLogo);
        return;
      }

      const logo = shadowRoot.querySelector("#logo");
      if (logo) {
        logo.remove(); // remove do DOM diretamente
        console.log("✅ Logo removido com sucesso");
        return;
      }

      requestAnimationFrame(tryRemoveLogo);
    }

    requestAnimationFrame(tryRemoveLogo);

    setInterval(() => {
      if (!tried) {
        tried = true;
        tryRemoveLogo();
        tried = false;
      }
    }, 2000);
  })();


  // DOBRA 5 - Acordeão Requisitos Mínimos
document.addEventListener('DOMContentLoaded', function() {
    const dobra5Headers = document.querySelectorAll('.dobra5-header');
    
    dobra5Headers.forEach(header => {
        header.addEventListener('click', function() {
            const content = this.nextElementSibling;
            const toggle = this.querySelector('.dobra5-toggle');
            
            // Fecha todos os outros
            document.querySelectorAll('.dobra5-content.active').forEach(activeContent => {
                if (activeContent !== content) {
                    activeContent.classList.remove('active');
                    activeContent.previousElementSibling.querySelector('.dobra5-toggle').classList.remove('rotate');
                }
            });
            
            // Alterna o atual
            content.classList.toggle('active');
            toggle.classList.toggle('rotate');
        });
    });
});