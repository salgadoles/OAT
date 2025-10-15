console.log("🚀 transition.js carregado!");

document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ DOM Content Loaded");
  
  if (typeof gsap === 'undefined') {
    console.error('❌ GSAP não carregado!');
    return;
  }

  createTransitionOverlay();
  
  setupLinkTransitions();
  
  animatePageEnter();
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
      
      if (href && !href.startsWith("#") && !href.startsWith("http" )) {
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

function animatePageEnter() {
  const overlay = document.querySelector('.transition-overlay');
  
  if (document.readyState === 'complete') {
    doPageEnterAnimation();
  } else {
    window.addEventListener('load', doPageEnterAnimation);
  }
}

function doPageEnterAnimation() {
  const overlay = document.querySelector('.transition-overlay');
  
  overlay.classList.add('active');
  gsap.set(overlay, { opacity: 1 });
  
  gsap.set(".scribble", { opacity: 0, scale: 1.1 });

  const tl = gsap.timeline({
    onComplete: () => {
      console.log('✅ Animação de entrada completa');
   
      gsap.to(overlay, {
        opacity: 0,
        duration: 0.6,
        onComplete: () => {
          overlay.classList.remove('active');
        }
      });
    }
  });

  tl.to(".scribble", {
    opacity: 1,
    scale: 1,
    duration: 0.7, 
    
  })
  .to(".scribble", {
    opacity: 0,
    duration: 0.7,

  }, "+=0.5");
}

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
