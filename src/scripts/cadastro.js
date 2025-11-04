function validarEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// ===== CADASTRO =====
document.getElementById("cadastroForm").addEventListener("submit", async function(e) {
e.preventDefault();
console.log("Formulário enviado");

const nome = document.getElementById("name").value.trim();
const email = document.getElementById("email").value.trim();
const senha = document.getElementById("password").value.trim();
const data = document.getElementById("date").value.trim();
const confirm = document.getElementById("confirmpassword").value.trim();
const errorMsg = document.getElementById("cadastroError");
const submitBtn = document.querySelector("#cadastroForm button[type='submit']");

// Validações frontend
if (!nome || !email || !senha || !data || !confirm) {
  errorMsg.textContent = "Preencha todos os campos!";
  return;
}
if (!validarEmail(email)) {
  errorMsg.textContent = "Digite um email válido!";
  return;
}
if (senha.length < 6) {
  errorMsg.textContent = "A senha deve ter pelo menos 6 caracteres!";
  return;
}
if (senha !== confirm) {
  errorMsg.textContent = "As senhas não coincidem!";
  return;
}

errorMsg.textContent = "";

// Mostrar loading no botão
const originalText = submitBtn.textContent;
submitBtn.textContent = "Cadastrando...";
submitBtn.disabled = true;

try {
  // Fazer requisição para o backend
  const response = await fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: nome,
      email: email,
      password: senha
      // A data de nascimento não está no modelo do backend, 
      // mas você pode adicionar se quiser
    })
  });

  const data = await response.json();

  if (response.ok) {
    // Cadastro bem-sucedido
    console.log('✅ Cadastro realizado com sucesso:', data);
    
    // Salvar o token no localStorage
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    
    // Redirecionar para a página de explorar
    location.href = "src/pages/explorar.html";
  } else {
    // Erro do backend
    errorMsg.textContent = data.message || 'Erro no cadastro. Tente novamente.';
    console.error('❌ Erro no cadastro:', data);
  }

} catch (error) {
  // Erro de rede ou outro erro
  console.error('💥 Erro na requisição:', error);
  errorMsg.textContent = 'Erro de conexão. Verifique se o servidor está rodando.';
} finally {
  // Restaurar botão
  submitBtn.textContent = originalText;
  submitBtn.disabled = false;
}
});

// Visualizar senha 
const inputSenha = document.getElementById("password");
const btnToggle = document.getElementById("toggleSenha");
const btnToggle2 = document.getElementById("toggleSenhaOff");

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

// login.js - se você tiver página de login
document.getElementById("loginForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("password").value.trim();
  const errorMsg = document.getElementById("loginError");
  const submitBtn = document.querySelector("#loginForm button[type='submit']");

  if (!email || !senha) {
    errorMsg.textContent = "Preencha todos os campos!";
    return;
  }

  errorMsg.textContent = "";
  
  // Mostrar loading no botão
  const originalText = submitBtn.textContent;
  submitBtn.textContent = "Entrando...";
  submitBtn.disabled = true;

  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: senha
      })
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Login realizado com sucesso:', data);
      
      // Salvar o token e dados do usuário
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Redirecionar
      location.href = "src/pages/explorar.html";
    } else {
      errorMsg.textContent = data.message || 'Erro no login. Tente novamente.';
      console.error('❌ Erro no login:', data);
    }

  } catch (error) {
    console.error('💥 Erro na requisição:', error);
    errorMsg.textContent = 'Erro de conexão. Verifique se o servidor está rodando.';
  } finally {
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
});