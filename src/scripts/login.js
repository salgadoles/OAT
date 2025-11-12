// /src/scripts/login.js
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se já está logado
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    
    if (token && user) {
        // Se já está logado, redireciona baseado no role
        redirectByRole(user.role);
        return;
    }

    // Configurar toggle de senha
    setupPasswordToggle();
    
    // Configurar formulário de login
    setupLoginForm();
});

function setupPasswordToggle() {
    const toggleSenha = document.getElementById('toggleSenha');
    const toggleSenhaOff = document.getElementById('toggleSenhaOff');
    const passwordInput = document.getElementById('password');

    if (toggleSenha && toggleSenhaOff && passwordInput) {
        toggleSenha.addEventListener('click', function() {
            passwordInput.type = 'text';
            toggleSenha.style.display = 'none';
            toggleSenhaOff.style.display = 'block';
        });

        toggleSenhaOff.addEventListener('click', function() {
            passwordInput.type = 'password';
            toggleSenhaOff.style.display = 'none';
            toggleSenha.style.display = 'block';
        });
    }
}

function setupLoginForm() {
    const loginForm = document.getElementById('login-Form');
    const loginError = document.getElementById('loginError');
    const loginButton = document.getElementById('loginButton');

    if (!loginForm) {
        console.log('❌ Formulário de login não encontrado');
        return;
    }

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Desabilitar botão durante a requisição
        loginButton.disabled = true;
        const originalText = loginButton.textContent;
        loginButton.textContent = 'Entrando...';

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        // Limpar mensagens anteriores
        hideMessage(loginError);

        // Validações básicas
        if (!email || !password) {
            showMessage(loginError, 'Preencha todos os campos!', 'error');
            loginButton.disabled = false;
            loginButton.textContent = originalText;
            return;
        }

        try {
            console.log('📤 Tentando login...', { email, password: '***' });

            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            console.log('📥 Status da resposta:', response.status);

            const resultado = await response.json();
            console.log('📋 Resposta do login:', resultado);

            if (response.ok && resultado.token) {
                // Salvar autenticação
                localStorage.setItem('token', resultado.token);
                localStorage.setItem('user', JSON.stringify(resultado.user));
                
                console.log('✅ Login realizado com sucesso');
                console.log('👤 Usuário:', resultado.user);

                // Mostrar mensagem de sucesso
                showMessage(loginError, 'Login realizado com sucesso! Redirecionando...', 'success');
                
                // Redirecionar após breve delay
                setTimeout(() => {
                    redirectByRole(resultado.user.role);
                }, 1000);
                
            } else {
                throw new Error(resultado.message || 'Erro no login');
            }
            
        } catch (error) {
            console.error('💥 ERRO NO LOGIN:', error);
            showMessage(loginError, error.message || 'Erro ao fazer login. Tente novamente.', 'error');
        } finally {
            // Reabilitar botão
            loginButton.disabled = false;
            loginButton.textContent = originalText;
        }
    });
}

// Função para redirecionar baseado no role
function redirectByRole(role) {
    console.log('🔄 Redirecionando usuário com role:', role);
    
    switch(role) {
        case 'admin':
            window.location.href = '/admin';
            break;
        case 'professor':
            window.location.href = '/professor';
            break;
        case 'student':
        default:
            window.location.href = '/src/pages/user/jornada.html';
            break;
    }
}

// Funções auxiliares para mensagens
function showMessage(element, message, type) {
    if (!element) return;
    
    element.textContent = message;
    element.className = `message ${type}`;
    element.style.display = 'block';
}

function hideMessage(element) {
    if (element) {
        element.style.display = 'none';
        element.textContent = '';
    }
}