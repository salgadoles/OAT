

// DO SAL -- codigo do botão de voltar ;)
(function () {
  const FALLBACK = "/src/pages/user/explorar.html";

  function referrerIsSameOrigin() {
    try {
      if (!document.referrer) return false;
      const ref = new URL(document.referrer);
      return ref.origin === location.origin;
    } catch (e) {
      return false;
    }
  }

  function tryBackOrFallback() {
    if (window.history.length > 1 && referrerIsSameOrigin()) {
      console.log("[Voltar] usando history.back()");
      window.history.back();
      return;
    }

    if (window.history.length > 1 && !referrerIsSameOrigin()) {
      console.log("[Voltar] histórico existe, mas referrer externo -> redirecionando para fallback");
      window.location.href = FALLBACK;
      return;
    }

    console.log("[Voltar] sem histórico -> redirecionando para fallback");
    window.location.href = FALLBACK;
  }

  function onDocumentClick(e) {
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;

    const target = /** @type {Element|null} */ (e.target instanceof Element ? e.target : null);
    if (!target) return;

    const voltarEl = target.closest("[voltar], [botaovoltar]");
    if (!voltarEl) return;

    e.preventDefault();

    tryBackOrFallback();
  }

  function onDocumentKeydown(e) {
    const key = e.key;
    if (key !== "Enter" && key !== " ") return;

    const active = document.activeElement;
    if (!active) return;

    const voltarEl = active.closest("[voltar], [botaovoltar]");
    if (!voltarEl) return;

    e.preventDefault();
    tryBackOrFallback();
  }

  function init() {
    console.log("js inicializado ronaldo");
    document.addEventListener("click", onDocumentClick, true);
    document.addEventListener("keydown", onDocumentKeydown, true);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.__appBackUtils = {
    tryBackOrFallback,
    referrer: document.referrer,
    historyLength: window.history.length,
    fallback: FALLBACK,
  };
})();

document.addEventListener('DOMContentLoaded', () => {
    const bookIcon = document.querySelector('img[src="/public/imagens/Interface  Book_Open.png"]');
    const iframe = document.getElementById('caderno-do-aluno-iframe');
    
    let isExpanded = false;
    let isOpen = false;

    // --- FUNÇÃO PARA ABRIR/FECHAR O CADERNO ---
    function toggleNotebook() {
        if (!isOpen) {
            // Abrir o caderno
            iframe.style.display = 'block';
            setTimeout(() => {
                iframe.style.transform = 'translateY(0)';
                iframe.style.opacity = '1';
            }, 10);
            isOpen = true;
        } else {
            // Fechar o caderno
            iframe.style.transform = 'translateY(100%)';
            iframe.style.opacity = '0';
            setTimeout(() => {
                iframe.style.display = 'none';
                isOpen = false;
                // Remove qualquer overlay quando fechar
                document.body.classList.remove('notebook-open', 'notebook-expanded');
            }, 300);
        }
    }

    // --- CONFIGURAÇÃO INICIAL ---
    if (iframe) {
        // Configuração inicial
        iframe.style.display = 'none';
        iframe.style.transform = 'translateY(100%)';
        iframe.style.opacity = '0';
        iframe.style.transition = 'all 0.3s cubic-bezier(0.19, 1, 0.22, 1)';
        iframe.style.position = 'fixed';
        iframe.style.bottom = '0';
        iframe.style.left = '0';
        iframe.style.width = '100%';
        iframe.style.height = '300px';
        iframe.style.zIndex = '10000';
        iframe.style.border = 'none';
        iframe.style.borderRadius = '20px 20px 0 0';
        
        // Adiciona estilos para os estados
        const style = document.createElement('style');
        style.textContent = `
            .notebook-open::before {
                content: '';
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                z-index: 9999;
                pointer-events: none;
            }
            
            .notebook-expanded::before {
                background: rgba(0, 0, 0, 0.9);
            }
            
            .notebook-expanded #caderno-do-aluno-iframe {
                height: 100vh !important;
                border-radius: 0 !important;
                box-shadow: 0 0 50px rgba(255, 195, 0, 0.5) !important;
            }
        `;
        document.head.appendChild(style);

        // Event listener para o ícone do livro
        if (bookIcon) {
            bookIcon.style.cursor = 'pointer';
            bookIcon.addEventListener('click', toggleNotebook);
        }
        
        // --- LISTENER PARA MENSAGEM DO IFRAME ---
        window.addEventListener('message', (event) => {
            if (event.source === iframe.contentWindow) {
                const data = event.data;
                
                if (data.type === 'toggle-notebook-expand') {
                    isExpanded = data.isExpanded;
                    
                    if (isExpanded) {
                        document.body.classList.add('notebook-expanded');
                        iframe.style.height = '100vh';
                        iframe.style.borderRadius = '0';
                    } else {
                        document.body.classList.remove('notebook-expanded');
                        iframe.style.height = '300px';
                        iframe.style.borderRadius = '20px 20px 0 0';
                    }
                    
                } else if (data.type === 'close-notebook') {
                    toggleNotebook();
                }
            }
        });

        // Fechar ao clicar no overlay (quando aberto)
        document.addEventListener('click', (e) => {
            if (isOpen && !iframe.contains(e.target) && e.target !== bookIcon) {
                // Se estiver expandido, primeiro minimiza
                if (isExpanded) {
                    // Envia mensagem para minimizar
                    iframe.contentWindow.postMessage({
                        type: 'minimize-notebook'
                    }, '*');
                } else {
                    // Se não estiver expandido, fecha
                    toggleNotebook();
                }
            }
        });

        // Fechar com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isOpen) {
                if (isExpanded) {
                    // Envia mensagem para minimizar
                    iframe.contentWindow.postMessage({
                        type: 'minimize-notebook'
                    }, '*');
                } else {
                    toggleNotebook();
                }
            }
        });
        
    } else {
        console.error("Iframe do Caderno do Aluno não encontrado.");
    }

    // Feedback visual para o ícone do livro
    if (bookIcon) {
        bookIcon.addEventListener('mouseenter', () => {
            bookIcon.style.transform = 'scale(1.1)';
            bookIcon.style.transition = 'transform 0.2s ease';
        });

        bookIcon.addEventListener('mouseleave', () => {
            bookIcon.style.transform = 'scale(1)';
        });
    }

    // Adiciona classe notebook-open quando o caderno está aberto
    const observer = new MutationObserver(() => {
        if (iframe.style.display === 'block') {
            document.body.classList.add('notebook-open');
        } else {
            document.body.classList.remove('notebook-open', 'notebook-expanded');
        }
    });

    observer.observe(iframe, { 
        attributes: true, 
        attributeFilter: ['style'] 
    });
});