// criarCurso.js - Versão com melhor tratamento de erro
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('createCourseForm');
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');

    // Verificar autenticação
    if (!token) {
        alert('⚠️ Você precisa estar logado para criar um curso');
        window.location.href = 'login.html';
        return;
    }

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Mostrar loading
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Criando...';
        submitBtn.disabled = true;

        try {
            const formData = {
                title: document.getElementById('title').value,
                description: document.getElementById('description').value,
                thumbnail: document.getElementById('thumbnail').value || '',
                price: parseFloat(document.getElementById('price').value) || 0,
                category: document.getElementById('category').value,
                level: document.getElementById('level').value,
                duration: 0,
                requirements: document.getElementById('requirements').value
                    .split('\n')
                    .filter(req => req.trim())
                    .slice(0, 5), // Limitar a 5 requisitos
                learningObjectives: document.getElementById('learningObjectives').value
                    .split('\n')
                    .filter(obj => obj.trim())
                    .slice(0, 5) // Limitar a 5 objetivos
            };

            console.log('📤 Enviando dados:', formData);

            const response = await fetch('http://localhost:5000/api/courses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            console.log('📥 Resposta recebida - Status:', response.status);

            // Tentar ler a resposta como texto primeiro para debug
            const responseText = await response.text();
            console.log('📄 Resposta texto:', responseText);

            let result;
            try {
                result = JSON.parse(responseText);
            } catch (parseError) {
                console.error('❌ Erro ao parsear JSON:', parseError);
                throw new Error(`Resposta inválida do servidor: ${responseText}`);
            }

            if (response.ok) {
                alert('✅ Curso criado com sucesso! Status: Rascunho');
                // Redirecionar para página de cursos do professor
                window.location.href = '/professor';
            } else {
                throw new Error(result.message || `Erro ${response.status}`);
            }

        } catch (error) {
            console.error('💥 Erro completo:', error);
            
            if (error.message.includes('Failed to fetch')) {
                alert('❌ Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
            } else if (error.message.includes('405')) {
                alert('❌ Método não permitido. Verifique as rotas do backend.');
            } else {
                alert('❌ Erro ao criar curso: ' + error.message);
            }
        } finally {
            // Restaurar botão
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });

    // Validação de preço para professores
    const priceInput = document.getElementById('price');
    if (priceInput && userRole === 'professor') {
        priceInput.addEventListener('blur', function() {
            const value = parseFloat(this.value);
            if (value > 100) {
                this.value = 100;
                alert('⚠️ Professores só podem criar cursos até R$ 100,00');
            }
        });
    }
});