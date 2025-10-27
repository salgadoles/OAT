// Animações GSAP para a página de vídeo
document.addEventListener('DOMContentLoaded', function() {
  // Animação de entrada dos elementos
  gsap.registerEffect({
    name: "fadeSlideUp",
    effect: (targets, config) => {
      return gsap.fromTo(targets, 
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: config.duration, ease: "power3.out", stagger: config.stagger }
      );
    },
    defaults: { duration: 0.8, stagger: 0.1 }
  });

  // Animação de entrada em sequência
  const tl = gsap.timeline();
  
  tl.fadeSlideUp(".video-player-section", { duration: 1 })
    .fadeSlideUp(".video-info-section", { duration: 0.8 }, "-=0.5")
    .fadeSlideUp(".recommended-video", { stagger: 0.15 }, "-=0.3");

  // Animação dos elementos flutuantes do background
  gsap.to(".floating-circle", {
    y: "+=20",
    rotation: "+=10",
    duration: 3,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
    stagger: 0.5
  });

  gsap.to(".floating-rect", {
    y: "+=15",
    rotation: "+=5",
    duration: 4,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
    stagger: 0.3
  });

  // Efeito de hover nos botões com GSAP
  document.querySelectorAll('.neon-hover').forEach(button => {
    button.addEventListener('mouseenter', () => {
      gsap.to(button, {
        scale: 1.05,
        boxShadow: "0 0 20px rgba(98, 186, 249, 0.6)",
        duration: 0.3,
        ease: "power2.out"
      });
    });
    
    button.addEventListener('mouseleave', () => {
      gsap.to(button, {
        scale: 1,
        boxShadow: "0 0 0px rgba(98, 186, 249, 0)",
        duration: 0.3,
        ease: "power2.out"
      });
    });
  });

  // Animação do progress bar simulada
  function animateProgressBar() {
    gsap.to(".progress-fill", {
      width: "85%",
      duration: 30,
      ease: "none",
      repeat: -1
    });
  }

  // Iniciar animação do progress bar quando o "play" for clicado
  document.querySelector('.play-btn').addEventListener('click', function() {
    this.textContent = this.textContent === '⏵' ? '⏸' : '⏵';
    animateProgressBar();
  });

  // Efeito de digitação no título (opcional)
  const title = document.querySelector('.video-title');
  const originalText = title.textContent;
  title.textContent = '';
  
  let charIndex = 0;
  const typeWriter = setInterval(() => {
    if (charIndex < originalText.length) {
      title.textContent += originalText.charAt(charIndex);
      charIndex++;
    } else {
      clearInterval(typeWriter);
    }
  }, 50);
});