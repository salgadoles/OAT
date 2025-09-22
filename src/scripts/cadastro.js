function validarEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// ===== CADASTRO =====
document.getElementById("cadastroForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const nome = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("password").value.trim();
  const data = document.getElementById("date").value.trim();
  const confirm = document.getElementById("confirmpassword").value.trim();
  const errorMsg = document.getElementById("cadastroError");

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
  alert("Cadastro realizado com sucesso!");
});