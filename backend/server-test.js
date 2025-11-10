const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Mock de usuários (em memória)
let users = [];

// Rota de health check
app.get('/api/health', (req, res) => {
    res.json({ message: 'Backend funcionando!', timestamp: new Date() });
});

// ROTA DE CADASTRO
app.post('/api/auth/register', async (req, res) => {
    try {
        console.log('📥 Dados recebidos:', req.body);
        
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
        }

        // Verificar se usuário já existe
        const userExists = users.find(u => u.email === email);
        if (userExists) {
            return res.status(400).json({ message: 'Usuário já existe' });
        }

        // Hash da senha
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Criar usuário
        const user = {
            id: Date.now().toString(),
            name,
            email,
            password: hashedPassword,
            role: 'student'
        };
        
        users.push(user);
        console.log('✅ Usuário criado:', user.email);

        // Gerar token JWT
        const token = jwt.sign(
            { id: user.id, role: user.role }, 
            'fallback_secret_super_seguro_123',
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'Usuário criado com sucesso!',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
        
    } catch (error) {
        console.error('💥 Erro no cadastro:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// ROTA DE LOGIN
app.post('/api/auth/login', async (req, res) => {
    try {
        console.log('📥 Login attempt:', req.body);
        
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email e senha são obrigatórios' });
        }

        // Encontrar usuário
        const user = users.find(u => u.email === email);
        if (!user) {
            return res.status(400).json({ message: 'Credenciais inválidas' });
        }

        // Verificar senha
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Credenciais inválidas' });
        }

        // Gerar token
        const token = jwt.sign(
            { id: user.id, role: user.role }, 
            'fallback_secret_super_seguro_123',
            { expiresIn: '24h' }
        );

        console.log('✅ Login realizado:', user.email);

        res.json({
            message: 'Login realizado com sucesso!',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
        
    } catch (error) {
        console.error('💥 Erro no login:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// Listar usuários (apenas para debug)
app.get('/api/users', (req, res) => {
    res.json(users.map(u => ({ ...u, password: '***' })));
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 BACKEND RODANDO NA PORTA ${PORT}`);
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log(`📋 Rotas disponíveis:`);
    console.log(`   POST http://localhost:${PORT}/api/auth/register`);
    console.log(`   POST http://localhost:${PORT}/api/auth/login`);
    console.log(`   GET  http://localhost:${PORT}/api/health`);
}); 