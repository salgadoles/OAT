console.log("🚀 transition.js carregado!");

document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ DOM Content Loaded");
  
  // Verificar GSAP
  if (typeof gsap === 'undefined') {
    console.error('❌ GSAP não carregado!');
    return;
  }

  // Criar overlay de transição
  createTransitionOverlay();
  
  // Adicionar eventos nos links
  setupLinkTransitions();
  
  // Animar entrada da página
  animatePageEnter();
});

function createTransitionOverlay() {
  let overlay = document.querySelector('.transition-overlay');
  
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "transition-overlay";
    overlay.innerHTML = `
      <img src="/public/imagens/Design sem nome.png" class="scribble scribble1">
      <img src="/public/imagens/WhatsApp Image 2025-10-14 at 09.55.38.jpeg" class="scribble scribble2">
      <img src="/public/imagens/WhatsApp Image 2025-10-14 at 09.55.51.jpeg" class="scribble scribble3">
    `;
    document.body.appendChild(overlay);
  }

  // Estado inicial
  gsap.set(overlay, { opacity: 0 });
  gsap.set(".scribble", { opacity: 0, scale: 1.1 });
}

function setupLinkTransitions() {
  const navLinks = document.querySelectorAll("[navbarsuperior] a.nav-item");
  console.log('🔗 Links encontrados:', navLinks.length);

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      
      if (href && !href.startsWith("#") && !href.startsWith("http")) {
        e.preventDefault();
        console.log('🔄 Iniciando transição para:', href);
        animatePageExit(href);
      }
    });
  });
}

// ANIMAÇÃO DE SAÍDA (quando clica em link)
function animatePageExit(href) {
  const overlay = document.querySelector('.transition-overlay');
  
  // Mostrar overlay
  overlay.classList.add('active');
  gsap.set(overlay, { opacity: 1 });
  
  const tl = gsap.timeline({
    onComplete: () => {
      console.log('✅ Transição completa, redirecionando...');
      setTimeout(() => {
        window.location.href = href;
      }, 400);
    }
  });

  // ANIMAÇÃO LENTA - CADA SLIDE TEM SEU TEMPO
  // Slide 1 aparece e fica visível
  tl.to(".scribble1", {
    opacity: 1,
    scale: 1,
    duration: 0.7,
    ease: "power2.out"
  })
  // Slide 1 some devagar
  .to(".scribble1", {
    opacity: 0,
    duration: 0.5,
    ease: "power2.in"
  }, "+=0.4") // Espera 0.4s antes de começar a desaparecer
  
  // Slide 2 aparece e fica visível
  .to(".scribble2", {
    opacity: 1,
    scale: 1,
    duration: 0.7,
    ease: "power2.out"
  })
  // Slide 2 some devagar
  .to(".scribble2", {
    opacity: 0,
    duration: 0.5,
    ease: "power2.in"
  }, "+=0.4")
  
  // Slide 3 aparece e fica visível
  .to(".scribble3", {
    opacity: 1,
    scale: 1,
    duration: 0.7,
    ease: "power2.out"
  })
  // Slide 3 some devagar
  .to(".scribble3", {
    opacity: 0,
    duration: 0.5,
    ease: "power2.in"
  }, "+=0.4");
}

// ANIMAÇÃO DE ENTRADA (quando a página carrega)
function animatePageEnter() {
  const overlay = document.querySelector('.transition-overlay');
  
  // Se a página já está completamente carregada
  if (document.readyState === 'complete') {
    doPageEnterAnimation();
  } else {
    window.addEventListener('load', doPageEnterAnimation);
  }
}

function doPageEnterAnimation() {
  const overlay = document.querySelector('.transition-overlay');
  
  // Mostrar overlay para a animação de entrada
  overlay.classList.add('active');
  gsap.set(overlay, { opacity: 1 });
  
  // Reset das imagens
  gsap.set(".scribble1", { opacity: 0, scale: 1.1 });
  gsap.set(".scribble2", { opacity: 0, scale: 1.1 });
  gsap.set(".scribble3", { opacity: 0, scale: 1.1 });

  const tl = gsap.timeline({
    onComplete: () => {
      console.log('✅ Animação de entrada completa');
      // Esconder overlay no final
      gsap.to(overlay, {
        opacity: 0,
        duration: 0.5,
        onComplete: () => {
          overlay.classList.remove('active');
        }
      });
    }
  });

  // ANIMAÇÃO DE ENTRADA (reversa) - TAMBÉM LENTA
  // Slide 3 aparece primeiro (reverso)
  tl.to(".scribble3", {
    opacity: 1,
    scale: 1,
    duration: 0.7,
    ease: "power2.out"
  })
  .to(".scribble3", {
    opacity: 0,
    duration: 0.5,
    ease: "power2.in"
  }, "+=0.3")
  
  // Slide 2 aparece
  .to(".scribble2", {
    opacity: 1,
    scale: 1,
    duration: 0.7,
    ease: "power2.out"
  })
  .to(".scribble2", {
    opacity: 0,
    duration: 0.5,
    ease: "power2.in"
  }, "+=0.3")
  
  // Slide 1 aparece por último
  .to(".scribble1", {
    opacity: 1,
    scale: 1,
    duration: 0.7,
    ease: "power2.out"
  })
  .to(".scribble1", {
    opacity: 0,
    duration: 0.5,
    ease: "power2.in"
  }, "+=0.3");
}

// DEBUG: Botão de teste (opcional)
function addTestButton() {
  const testButton = document.createElement('button');
  testButton.textContent = '🧪 TESTAR TRANSIÇÃO';
  testButton.style.cssText = `
    position: fixed;
    top: 70px;
    right: 20px;
    z-index: 10000;
    padding: 10px 15px;
    background: #ff4444;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
    font-weight: bold;
  `;
  testButton.addEventListener('click', () => {
    console.log('🧪 Testando transição manualmente');
    animatePageExit(window.location.href);
  });
  document.body.appendChild(testButton);
}

// Descomente a linha abaixo se quiser o botão de teste
// addTestButton();