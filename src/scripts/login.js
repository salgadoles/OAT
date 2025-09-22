function validarEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// ===== LOGIN =====
document.getElementById("login-Form").addEventListener("submit", function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("password").value.trim();
    const errorMsg = document.getElementById("loginError");

    if (!email || !senha) {
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

    errorMsg.textContent = "Login realizado com sucesso!";
    document.getElementById("email").value = "";
    document.getElementById("password").value = "";
    location.href = "../pages/home.html";
});
