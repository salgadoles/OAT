document.addEventListener('DOMContentLoaded', function() {    // Inicialização das funcionalidades, ja cala sua boca cristian
    initializeNavigation();
    initializeClassCards();
    initializeUserMenu();
    initializeActionButtons();
    initializeAnimations();
    initializeResponsiveFeatures();
    console.log('OAT Platform initialized successfully');
});
// Navegação e menu
function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item, .nav-item-right');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class de todos os itens
            navItems.forEach(nav => nav.classList.remove('active'));
            // Adiciona active class ao item clicado
            this.classList.add('active');
            // Animação de feedback
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
            console.log('Navigation item clicked:', this.textContent.trim());
        });
        // Efeito hover aprimorado
        item.addEventListener('mouseenter', function() {
            if (!this.classList.contains('active')) {
                this.style.background = '#4a4a4a';
            }
        });
        item.addEventListener('mouseleave', function() {
            if (!this.classList.contains('active')) {
                this.style.background = '#3a3a3a';
            }
        });
    });
}
// Funcionalidades dos cards de turma
function initializeClassCards() {
    const classCards = document.querySelectorAll('.class-card');
    classCards.forEach((card, index) => {
        // Click handler para o card
        card.addEventListener('click', function(e) {
            // Previne propagação se clicou em um ícone
            if (e.target.classList.contains('class-icon') || e.target.closest('.class-icon')) {
                return;
            }
            // Animação de seleção
            this.style.transform = 'scale(0.98)';
            this.style.boxShadow = '0 8px 25px rgba(74, 144, 226, 0.4)';
            setTimeout(() => {
                this.style.transform = '';
                this.style.boxShadow = '';
            }, 200);
            // Simula navegação para a turma
            const turmaName = this.querySelector('.class-title').textContent;
            console.log('Navegando para:', turmaName);
            // Aqui você pode adicionar a lógica de navegação real
            showNotification(`Abrindo ${turmaName}...`);
        });
        // Funcionalidades dos ícones de ação
        const actionIcons = card.querySelectorAll('.class-icon');
        actionIcons.forEach(icon => {
            icon.addEventListener('click', function(e) {
                e.stopPropagation();
                // Animação do ícone
                this.style.transform = 'scale(1.2) rotate(10deg)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 200);
                // Determina a ação baseada no ícone
                const isUsersIcon = this.querySelector('.fa-users');
                const isShareIcon = this.querySelector('.fa-share');
               
                if (isUsersIcon) {
                    handleUsersAction(card);
                } else if (isShareIcon) {
                    handleShareAction(card);
                }
            });
        });
       
        // Efeito de hover aprimorado
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-6px)';
            this.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.4)';
        });
       
        card.addEventListener('mouseleave', function() {
            this.style.transform = '';
            this.style.boxShadow = '';
        });
    });
}
// Ação de usuários (visualizar alunos)
function handleUsersAction(card) {
    const turmaName = card.querySelector('.class-title').textContent;
    console.log('Visualizando alunos da:', turmaName);
    // Simula abertura de modal de alunos
    showNotification(`Visualizando alunos da ${turmaName}`);
   
    // Aqui você pode implementar um modal real
    // showStudentsModal(turmaName);
}
// Ação de compartilhar
function handleShareAction(card) {
    const turmaName = card.querySelector('.class-title').textContent;
    console.log('Compartilhando:', turmaName);
   
    // Simula funcionalidade de compartilhamento
    if (navigator.share) {
        navigator.share({
            title: 'OAT - ' + turmaName,
            text: 'Confira esta turma na plataforma OAT',
            url: window.location.href
        });
    } else {
        // Fallback para navegadores que não suportam Web Share API
        copyToClipboard(window.location.href);
        showNotification('Link copiado para a área de transferência!');
    }
}
 
// Menu do usuário
function initializeUserMenu() {
    const userMenu = document.querySelector('.user-menu');
    const settingsIcon = document.querySelector('.settings-icon');
   
    if (userMenu) {
        userMenu.addEventListener('click', function() {
            // Animação de clique
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
           
            console.log('User menu clicked');
            showNotification('Menu do usuário');
           
            // Aqui você pode implementar um dropdown menu
            // toggleUserDropdown();
        });
    }
   
    if (settingsIcon) {
        settingsIcon.addEventListener('click', function() {
            // Animação de rotação
            const icon = this.querySelector('i');
            icon.style.transform = 'rotate(180deg)';
            setTimeout(() => {
                icon.style.transform = '';
            }, 300);
           
            console.log('Settings clicked');
            showNotification('Configurações');
           
            // Aqui você pode implementar as configurações
            // openSettingsModal();
        });
    }
}
 
// Botões de ação
function initializeActionButtons() {
    const btnPrimary = document.querySelector('.btn-primary');
    const btnSecondary = document.querySelector('.btn-secondary');
   
    if (btnPrimary) {
        btnPrimary.addEventListener('click', function() {
            // Animação de clique
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
           
            console.log('Create account clicked');
            showNotification('Redirecionando para criação de conta...');
           
            // Simula redirecionamento
            setTimeout(() => {
                // window.location.href = '/register';
                console.log('Redirecting to registration page');
            }, 1000);
        });
    }
   
    if (btnSecondary) {
        btnSecondary.addEventListener('click', function() {
            // Animação de clique
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
           
            console.log('Continue with Google clicked');
            showNotification('Conectando com Google...');
           
            // Simula autenticação com Google
            setTimeout(() => {
                // Implementar OAuth do Google aqui
                console.log('Google OAuth initiated');
            }, 1000);
        });
    }
}
 
// Animações e efeitos visuais
function initializeAnimations() {
    // Observador de interseção para animações de entrada
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
   
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
   
    // Observa elementos para animação
    const animatedElements = document.querySelectorAll('.class-card, .hero-content, .action-bar');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
   
    // Efeito de paralaxe sutil no hero
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const heroSection = document.querySelector('.hero-section');
       
        if (heroSection) {
            const rate = scrolled * -0.5;
            heroSection.style.transform = `translateY(${rate}px)`;
        }
    });
}
 
// Recursos responsivos
function initializeResponsiveFeatures() {
    // Detecta mudanças de orientação e redimensionamento
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
   
    function handleResize() {
        // Ajusta layout baseado no tamanho da tela
        const width = window.innerWidth;
        const classesGrid = document.querySelector('.classes-grid');
       
        if (classesGrid) {
            if (width <= 480) {
                classesGrid.style.gridTemplateColumns = '1fr';
            } else if (width <= 768) {
                classesGrid.style.gridTemplateColumns = 'repeat(2, 1fr)';
            } else if (width <= 1200) {
                classesGrid.style.gridTemplateColumns = 'repeat(3, 1fr)';
            } else {
                classesGrid.style.gridTemplateColumns = 'repeat(4, 1fr)';
            }
        }
       
        console.log('Layout adjusted for width:', width);
    }
   
    // Chama uma vez para configuração inicial
    handleResize();
}
 
// Funções utilitárias
function showNotification(message, duration = 3000) {
    // Remove notificação existente se houver
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
   
    // Cria nova notificação
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
   
    // Estilos da notificação
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: '#4a90e2',
        color: 'white',
        padding: '12px 20px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        zIndex: '1000',
        fontSize: '14px',
        fontWeight: '500',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease',
        maxWidth: '300px',
        wordWrap: 'break-word'
    });
   
    document.body.appendChild(notification);
   
    // Animação de entrada
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
   
    // Remove após duração especificada
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, duration);
} function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text);
    } else {
        // Fallback para navegadores mais antigos
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
    }
}
// Funcionalidades de teclado
document.addEventListener('keydown', function(e) {
    // Atalhos de teclado
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case 'k':
                e.preventDefault();
                // Implementar busca rápida
                showNotification('Busca rápida (Ctrl+K)');
                break;
            case 'n':
                e.preventDefault();
                // Criar nova turma
                showNotification('Nova turma (Ctrl+N)');
                break;
        }
    }
    // Navegação com setas
    if (e.key === 'Escape') {
        // Fechar modais ou menus abertos
        console.log('Escape pressed - closing modals');
    }
});
// Funcionalidades de acessibilidade
function initializeAccessibility() {
    // Adiciona suporte a navegação por teclado
    const focusableElements = document.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
   
    focusableElements.forEach(element => {
        element.addEventListener('focus', function() {
            this.style.outline = '2px solid #4a90e2';
            this.style.outlineOffset = '2px';
        });
       
        element.addEventListener('blur', function() {
            this.style.outline = '';
            this.style.outlineOffset = '';
        });
    });
}
 
// Inicializa acessibilidade
initializeAccessibility();
 
// Funcionalidades de performancee
function optimizePerformance() {
    // Lazy loading para imagens (se houver)
    const images = document.querySelectorAll('img[data-src]');
   
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
       
        images.forEach(img => imageObserver.observe(img));
    }
   
    // Debounce para eventos de scrollllll e resize
    let scrollTimeout;
    let resizeTimeout;
   
    window.addEventListener('scroll', function() {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            // Lógica de scroll otimizada
        }, 16); // ~60fps
    });
   
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            handleResize();
        }, 250);
    });
}
 
// Inicializa otimizações de performance
optimizePerformance();
 
// Estado da aplicaçãoes
const appState = {
    currentUser: null,
    selectedClass: null,
    notifications: [],
    theme: 'dark'
};
// Gerenciamento de estado
function updateAppState(key, value) {
    appState[key] = value;
    console.log('App state updated:', key, value);
   
    // Salva no localStorage para persistência
    localStorage.setItem('oat_app_state', JSON.stringify(appState));
}
// Carrega estado salvo
function loadAppState() {
    const savedState = localStorage.getItem('oat_app_state');
    if (savedState) {
        Object.assign(appState, JSON.parse(savedState));
        console.log('App state loaded:', appState);
    }
}
// Carrega estado na inicialização
loadAppState();
 
// Funcionalidades de tema (para futuras implementaçõesssss)
function toggleTheme() {
    const currentTheme = appState.theme;
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
   
    document.body.classList.remove(`theme-${currentTheme}`);
    document.body.classList.add(`theme-${newTheme}`);
   
    updateAppState('theme', newTheme);
    showNotification(`Tema alterado para ${newTheme === 'dark' ? 'escuro' : 'claro'}`);
}
// Exporta funções para uso global se necessário, fds
window.OATApp = {
    showNotification,
    updateAppState,
    toggleTheme,
    appState
};
console.log('OAT Platform JavaScript loaded successfully');