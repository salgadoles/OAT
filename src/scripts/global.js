// Validação de formulários

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

