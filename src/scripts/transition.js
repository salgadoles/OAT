console.log("🚀 transition.js carregado!");

document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ DOM Content Loaded");
  
  if (typeof gsap === 'undefined') {
    console.error('❌ GSAP não carregado!');
    return;
  }

  createTransitionOverlay();
  setupLinkTransitions();
});

function createTransitionOverlay() {
  let overlay = document.querySelector('.transition-overlay');
  
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "transition-overlay";
    overlay.innerHTML = `
      <img src="/public/imagens/llufinal.svg" class="scribble">
    `;
    document.body.appendChild(overlay);
  }

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

function animatePageExit(href) {
  const overlay = document.querySelector('.transition-overlay');

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

  tl.to(".scribble", {
    opacity: 1,
    scale: 1,
    duration: 0.6, 
  })
  .to(".scribble", {
    opacity: 0,
    duration: 0.6, 
  }, "+=0.5"); 
}

// 🧪 Mantido o botão de teste opcional
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

// addTestButton();


// /src/scripts/global.js

document.addEventListener("DOMContentLoaded", () => {
  // === BOTÃO VOLTAR UNIVERSAL ===
  const btnVoltar = document.querySelector("[voltar]");
  if (btnVoltar) {
    btnVoltar.addEventListener("click", (event) => {
      event.preventDefault();

      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = "/src/pages/user/explorar.html";
      }
    });
  }

  // === OUTRAS FUNÇÕES GLOBAIS ===
  // Exemplo: remover logo do Spline, iniciar transições, etc.
  console.log("🌐 Script global carregado!");
});
  