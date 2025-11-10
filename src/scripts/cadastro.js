// Função para validar email
function validarEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// ===== CADASTRO =====
document.addEventListener('DOMContentLoaded', function () {
  const cadastroForm = document.getElementById("cadastroForm");

  if (!cadastroForm) {
    console.log('❌ Formulário de cadastro não encontrado');
    return;
  }

  cadastroForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    console.log("=== INICIANDO CADASTRO ===");

    const nome = document.getElementById("name")?.value.trim();
    const email = document.getElementById("email")?.value.trim();
    const senha = document.getElementById("password")?.value.trim();
    const dataNascimento = document.getElementById("date")?.value.trim(); // ✅ Mudei o nome
    const confirm = document.getElementById("confirmpassword")?.value.trim();
    const errorMsg = document.getElementById("cadastroError");
    const submitBtn = document.querySelector("#cadastroForm button[type='submit']");

    // Verificar se todos os elementos existem
    if (!nome || !email || !senha || !dataNascimento || !confirm || !errorMsg || !submitBtn) {
      console.log('❌ Elementos do formulário não encontrados');
      return;
    }

    console.log('📝 Dados do formulário:', { nome, email, senha: '***', dataNascimento, confirm: '***' });

    // Validações frontend
    if (!nome || !email || !senha || !dataNascimento || !confirm) {
      errorMsg.textContent = "Preencha todos os campos!";
      errorMsg.style.color = 'red';
      errorMsg.style.display = 'block';
      return;
    }
    if (!validarEmail(email)) {
      errorMsg.textContent = "Digite um email válido!";
      errorMsg.style.color = 'red';
      errorMsg.style.display = 'block';
      return;
    }
    if (senha.length < 6) {
      errorMsg.textContent = "A senha deve ter pelo menos 6 caracteres!";
      errorMsg.style.color = 'red';
      errorMsg.style.display = 'block';
      return;
    }
    if (senha !== confirm) {
      errorMsg.textContent = "As senhas não coincidem!";
      errorMsg.style.color = 'red';
      errorMsg.style.display = 'block';
      return;
    }

    errorMsg.textContent = "";
    errorMsg.style.display = 'none';

    // Mostrar loading no botão
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Cadastrando...";
    submitBtn.disabled = true;

    try {
      console.log('📤 Enviando dados para API...');

      const dadosParaEnviar = {
        name: nome,
        email: email,
        password: senha,
        nascimento: dataNascimento || undefined
      };

      console.log('🔧 Dados sendo enviados:', dadosParaEnviar);

      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosParaEnviar)
      });

      console.log('📥 Status da resposta:', response.status);

      // ✅ CORREÇÃO: Mudei o nome da variável para 'resultado'
      const resultado = await response.json();
      console.log('📋 Dados da resposta:', resultado);

      if (response.ok) {
        console.log('✅ Cadastro realizado com sucesso');

        // Salvar o token no localStorage
        if (resultado.token) {
          localStorage.setItem('token', resultado.token);
          localStorage.setItem('user', JSON.stringify(resultado.user));
          console.log('🔐 Token salvo no localStorage');
        }

        // ✅ CORREÇÃO FINAL: Use 'resultado' em vez de 'result'
        if (resultado.token && resultado.user) {
          // Mostrar mensagem de sucesso
          errorMsg.textContent = 'Cadastro realizado com sucesso! Redirecionando...';
          errorMsg.style.color = 'green';
          errorMsg.style.display = 'block';

          setTimeout(() => {
            // ✅ Redirecionar para explorar na MESMA página
            window.location.href = '/explorar';
          }, 1500);
        }
      } else {
        console.error('❌ Erro no cadastro:', resultado);
        errorMsg.textContent = resultado.message || `Erro ${response.status} no cadastro`;
        errorMsg.style.color = 'red';
        errorMsg.style.display = 'block';
      }

    } catch (error) {
      console.error('💥 Erro na requisição:', error);

      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        errorMsg.textContent = 'Erro de conexão. Verifique: 1) Backend está rodando? 2) CORS está configurado?';
      } else {
        errorMsg.textContent = 'Erro inesperado: ' + error.message;
      }
      errorMsg.style.color = 'red';
      errorMsg.style.display = 'block';
    } finally {
      // Restaurar botão
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });

  // Visualizar senha (com verificação)
  const inputSenha = document.getElementById("password");
  const btnToggle = document.getElementById("toggleSenha");
  const btnToggle2 = document.getElementById("toggleSenhaOff");

  if (inputSenha && btnToggle && btnToggle2) {
    btnToggle.addEventListener("click", () => {
      if (inputSenha.type === "password") {
        inputSenha.type = "text";
        btnToggle2.style.display = "block";
        btnToggle.style.display = "none";
      }
    });

    btnToggle2.addEventListener("click", () => {
      if (inputSenha.type === "text") {
        inputSenha.type = "password";
        btnToggle2.style.display = "none";
        btnToggle.style.display = "block";
      }
    });
  }

  // TESTE DE CONEXÃO
  async function testarConexao() {
    console.log('=== 🔍 TESTANDO CONEXÃO COM BACKEND ===');

    try {
      const response = await fetch('http://localhost:5000/api/health');
      const healthData = await response.json(); // ✅ Mudei o nome aqui também
      console.log('✅ BACKEND CONECTADO - Resposta:', healthData);
      return true;
    } catch (error) {
      console.log('❌ ERRO DE CONEXÃO:', error.message);
      console.log('💡 Verifique se:');
      console.log('   1. Backend está rodando (npm run dev)');
      console.log('   2. Porta 5000 está livre');
      console.log('   3. Não há erros no terminal do backend');
      return false;
    }
  }

  // Teste automático ao carregar a página
  testarConexao();
});