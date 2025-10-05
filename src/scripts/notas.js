const inputTittle = document.getElementById("titulo");
const inputContent = document.getElementById("conteudo");
const container = document.getElementById("notas");
const headernotas   = document.getElementsByClassName("header-notas");

inputTittle.addEventListener("input", function () {
    this.style.height = "auto";
    this.style.height = this.scrollHeight + "px";
});

inputContent.addEventListener("input", function () {
    this.style.height = "auto";
    this.style.height = this.scrollHeight + "px";
});

const limpar = document.getElementsByClassName("box-trash");

limpar[0].addEventListener("click", function () {
    inputTittle.value = "";
    inputTittle.style.height = "auto";
    inputContent.value = "";
    inputContent.style.height = "auto";
});

// CRIAÇÃO DE NOTAS 

const bancoDeDados = [ // Simulação de banco de dados
    { titulo: "Curso de HTML", descricao: "Aprenda a estruturar páginas web com HTML5." },
    { titulo: "Curso de CSS", descricao: "Estilize suas páginas com CSS moderno." },
    { titulo: "Curso de JavaScript", descricao: "Dê vida ao seu site com JS puro." },
    { titulo: "Curso de React", descricao: "Crie aplicações poderosas com React.js." }
];

let indice = 0;

inputContent.addEventListener("focusout", () => CriarCard());
inputTittle.addEventListener("focusout", () => CriarCard());


// CRIAR NOTA 
function CriarCard() {
    const fieldTittleValue = inputTittle.value;
    const fieldTextValue = inputContent.value;

    fieldTittleValue.parseString;
    fieldTextValue.parseString;

    const conteudo = fieldTextValue;
    const titulo = fieldTittleValue;

    if (fieldTextValue === "") {
        inputContent.style.border = "1px solid red";
        return;
    } 
    
    if (fieldTittleValue === "") {
        inputTittle.style.border = "1px solid red";
        return;
    } else {
        inputTittle.style.border = "none";
        inputContent.style.border = "none";
    }

    console.log("teste");
    // Criar card
    const card = document.createElement("div");
    card.classList.add("nota");
    card.innerHTML = `
          <h3>${titulo}</h3>
          <p>${conteudo}</p>
          <button class="editar-nota">Editar</button>
          <button class="excluir-nota">Excluir</button>
        `;

    container.appendChild(card);


    inputTittle.value = "";
    inputTittle.style.height = "auto";
    inputContent.value = "";
    inputContent.style.height = "auto";


    const guardarDados = {
        titulo: titulo,
        descricao: conteudo
    }

    console.log(bancoDeDados);

    bancoDeDados.push(guardarDados);

    indice++;

}


// EXCLUIR NOTA
container.addEventListener("click", function (e) {
    if (e.target.classList.contains("excluir-nota")) {
        const nota = e.target.parentElement;
        container.removeChild(nota);
        indice--;
    }
});

// EDITAR NOTA
container.addEventListener("click", function (e) {
    if (e.target.classList.contains("editar-nota")) {
        const nota = e.target.parentElement;
        const tituloAtual = nota.querySelector("h3").innerText;
        const conteudoAtual = nota.querySelector("p").innerText;
        inputTittle.value = tituloAtual;
        inputContent.value = conteudoAtual;
        nota.remove();
        indice--;
        inputTittle.style.height = "auto";
        inputTittle.style.height = inputTittle.scrollHeight + "px";
        inputContent.style.height = "auto";
        inputContent.style.height = inputContent.scrollHeight + "px";
        headernotas.focus();


    }
});