document.addEventListener('DOMContentLoaded', () => {
    // 1. Interatividade da lista de atividades
    const activityItems = document.querySelectorAll('.activity-item');
    activityItems.forEach(item => {
        item.addEventListener('click', () => {
            const title = item.querySelector('.activity-title').textContent;
            alert(`Você clicou na atividade: "${title}".`);
        });
    });

    // 2. Interatividade do botão "Criar Atividade"
    const createActivityBtn = document.querySelector('.create-activity-btn');
    if (createActivityBtn) {
        createActivityBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Evita que o clique se propague para outros elementos
            alert('Funcionalidade: Abrir modal/formulário para criar nova atividade.');
        });
    }

    // 3. Interatividade da barra de ferramentas (apenas o botão de envio)
    const sendButtonTop = document.querySelector('.top-message-bar .send-button');
    if (sendButtonTop) {
        sendButtonTop.addEventListener('click', () => {
            const input = document.querySelector('.top-message-bar input');
            if (input.value.trim() !== "") {
                alert(`Mensagem enviada: "${input.value}"`);
                input.value = ''; // Limpa o campo
            } else {
                alert('Digite uma mensagem para enviar.');
            }
        });
    }

    // 4. Interatividade da barra de ferramentas inferior (simulação de clique)
    const toolbarButtons = document.querySelectorAll('.editor-toolbar button');
    toolbarButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const icon = button.querySelector('i');
            if (icon) {
                alert(`Ícone clicado: ${icon.className}`);
            }
        });
    });
});