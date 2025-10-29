// Primeiro, vamos verificar se o Three.js carregou
console.log('Script.js carregando...');

// Aguarda o DOM e o Three.js carregarem
window.addEventListener('load', function() {
    console.log('Página totalmente carregada');
    initializeApp();
});

function initializeApp() {
    console.log('Inicializando aplicação...');
    
    // Verifica se Three.js está disponível
    if (typeof THREE === 'undefined') {
        console.error('❌ Three.js não está carregado!');
        showError('Three.js não carregou. Verifique sua conexão.');
        return;
    }
    
    console.log('✅ Three.js carregado com sucesso! Versão:', THREE.REVISION);
    
    // Inicializa o Three.js primeiro
    const threeJSSuccess = initializeThreeJS();
    
    if (threeJSSuccess) {
        // Depois inicializa as outras funcionalidades
        initializeNavigation();
        initializeClassCards();
        initializeUserMenu();
        initializeActionButtons();
        console.log('🎉 OAT Platform inicializada com sucesso!');
    }
}

/* ==========================
   THREE.JS - VERSÃO CORRIGIDA
========================== */
function initializeThreeJS() {
    try {
        console.log('🔄 Inicializando Three.js...');
        
        const container = document.getElementById('hero-section');
        if (!container) {
            console.error('❌ Elemento hero-section não encontrado');
            return false;
        }

        console.log('✅ Container encontrado');

        // 1. Cria o renderer
        const renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true 
        });
        
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0); // Fundo transparente
        
        // Adiciona classes CSS
        renderer.domElement.classList.add('threejs-canvas');
        
        // Insere o canvas no container
        container.appendChild(renderer.domElement);
        console.log('✅ Canvas criado e inserido');

        // 2. Cria a cena
        const scene = new THREE.Scene();

        // 3. Cria a câmera
        const camera = new THREE.PerspectiveCamera(
            75, 
            container.clientWidth / container.clientHeight, 
            0.1, 
            1000
        );
        camera.position.z = 1;

        // 4. Cria a geometria (plano que cobre a tela toda)
        const geometry = new THREE.PlaneGeometry(2, 2);

        // 5. Cria o material com shader
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0.0 },
                resolution: { value: new THREE.Vector2(container.clientWidth, container.clientHeight) },
                mouse: { value: new THREE.Vector2(0.5, 0.5) }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec2 resolution;
                uniform vec2 mouse;
                varying vec2 vUv;
                
                void main() {
                    vec2 uv = vUv;
                    
                    // Efeito de movimento suave
                    float wave1 = sin(uv.x * 5.0 + time * 2.0) * 0.05;
                    float wave2 = cos(uv.y * 3.0 + time * 1.5) * 0.03;
                    uv.x += wave1 + wave2;
                    
                    // Gradiente azul principal
                    vec3 primaryColor = vec3(0.1, 0.3, 0.8);
                    vec3 secondaryColor = vec3(0.0, 0.1, 0.4);
                    vec3 accentColor = vec3(0.2, 0.6, 1.0);
                    
                    // Cria padrão interessante
                    float pattern = sin(uv.x * 20.0 + time) * cos(uv.y * 15.0 + time) * 0.1;
                    
                    // Mix de cores baseado na posição
                    vec3 color = mix(primaryColor, secondaryColor, uv.y);
                    color += accentColor * pattern;
                    
                    // Efeito de brilho
                    float glow = sin(time * 3.0) * 0.1 + 0.1;
                    color += glow * accentColor;
                    
                    gl_FragColor = vec4(color, 0.7);
                }
            `,
            transparent: true
        });

        // 6. Cria a mesh e adiciona à cena
        const plane = new THREE.Mesh(geometry, material);
        scene.add(plane);
        console.log('✅ Cena configurada');

        // 7. Configura o resize handler
        function handleResize() {
            const width = container.clientWidth;
            const height = container.clientHeight;
            
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            
            renderer.setSize(width, height);
            material.uniforms.resolution.value.set(width, height);
            
            console.log('📐 Canvas redimensionado:', width, 'x', height);
        }

        // 8. Configura interação do mouse
        function handleMouseMove(event) {
            const rect = container.getBoundingClientRect();
            const x = (event.clientX - rect.left) / rect.width;
            const y = 1.0 - (event.clientY - rect.top) / rect.height; // Invert Y
            
            material.uniforms.mouse.value.set(x, y);
        }

        // 9. Adiciona event listeners
        window.addEventListener('resize', handleResize);
        container.addEventListener('mousemove', handleMouseMove);

        // 10. Loop de animação
        function animate() {
            requestAnimationFrame(animate);
            
            // Atualiza o tempo
            material.uniforms.time.value += 0.01;
            
            // Renderiza a cena
            renderer.render(scene, camera);
        }

        // Inicia a animação
        animate();
        console.log('✅ Animação iniciada');
        
        return true;

    } catch (error) {
        console.error('❌ Erro no Three.js:', error);
        showError('Erro ao inicializar efeitos visuais: ' + error.message);
        return false;
    }
}

/* ==========================
   FUNÇÕES ORIGINAIS (simplificadas)
========================== */
function initializeNavigation() {
    console.log('🔄 Inicializando navegação...');
    const navItems = document.querySelectorAll('.nav-item, .nav-item-right');
    
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            console.log('📌 Navegação:', this.textContent.trim());
        });
    });
}

function initializeClassCards() {
    console.log('🔄 Inicializando cards...');
    const classCards = document.querySelectorAll('.class-card');
    
    classCards.forEach(card => {
        card.addEventListener('click', function(e) {
            if (e.target.classList.contains('class-icon')) return;
            
            const turmaName = this.querySelector('.class-title').textContent;
            console.log('🎓 Abrindo turma:', turmaName);
            showNotification(`Abrindo ${turmaName}...`);
        });

        // Ícones de ação
        const icons = card.querySelectorAll('.class-icon');
        icons.forEach(icon => {
            icon.addEventListener('click', function(e) {
                e.stopPropagation();
                const action = this.classList.contains('fa-users') ? 'alunos' : 'compartilhar';
                console.log(`🔧 Ação: ${action}`);
                showNotification(`Ação: ${action}`);
            });
        });
    });
}

function initializeUserMenu() {
    console.log('🔄 Inicializando menu do usuário...');
    const userMenu = document.querySelector('.user-menu');
    const settings = document.querySelector('.settings-icon');
    
    if (userMenu) {
        userMenu.addEventListener('click', () => {
            console.log('👤 Menu do usuário');
            showNotification('Menu do usuário');
        });
    }
    
    if (settings) {
        settings.addEventListener('click', () => {
            console.log('⚙️ Configurações');
            showNotification('Configurações');
        });
    }
}

function initializeActionButtons() {
    console.log('🔄 Inicializando botões...');
    const btnPrimary = document.querySelector('.btn-primary');
    const btnSecondary = document.querySelector('.btn-secondary');
    
    if (btnPrimary) {
        btnPrimary.addEventListener('click', () => {
            console.log('📝 Criar conta');
            showNotification('Criando conta...');
        });
    }
    
    if (btnSecondary) {
        btnSecondary.addEventListener('click', () => {
            console.log('🔗 Continuar com Google');
            showNotification('Conectando com Google...');
        });
    }
}

/* ==========================
   FUNÇÕES UTILITÁRIAS
========================== */
function showNotification(message, duration = 3000) {
    // Remove notificação existente
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    // Cria nova notificação
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4a90e2;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        font-family: 'Inter', sans-serif;
        font-size: 14px;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Animação de entrada
    setTimeout(() => notification.style.transform = 'translateX(0)', 100);
    
    // Remove após o tempo
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, duration);
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #e74c3c;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        z-index: 10000;
        font-family: 'Inter', sans-serif;
    `;
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => errorDiv.remove(), 5000);
}

// Fallback caso o load event não dispare
setTimeout(() => {
    if (!window.appInitialized) {
        console.log('⏰ Fallback: Inicializando app...');
        initializeApp();
    }
}, 1000);