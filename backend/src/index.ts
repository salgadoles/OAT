import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';

// Routes
import authRoutes from './routes/authRoutes';
import courseRoutes from './routes/courseRoutes';
import lessonRoutes from './routes/lessonRoutes';
import videoRoutes from './routes/videoRoutes';
import activityRoutes from './routes/activityRoutes';
import enrollmentRoutes from './routes/enrollmentRoutes';
import userRoutes from './routes/userRoutes';

// Config
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ CORS para desenvolvimento
app.use(cors({
    origin: [
        'http://localhost:5500', 
        'http://127.0.0.1:5500',
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5802'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Middleware
app.use(express.json());

// ✅ SERVIR ARQUIVOS ESTÁTICOS DO FRONTEND - CAMINHO CORRIGIDO
app.use(express.static(path.join(__dirname, '../../')));

// ✅ ROTAS PARA PÁGINAS PRINCIPAIS - CAMINHOS CORRIGIDOS
app.get('/', (_req, res) => {
    res.sendFile(path.join(__dirname, '../../src/pages/user/explorar.html'));
});

app.get('/login', (_req, res) => {
    res.sendFile(path.join(__dirname, '../../src/pages/user/login.html'));
});

app.get('/cadastro', (_req, res) => {
    res.sendFile(path.join(__dirname, '../../src/pages/user/cadastro.html'));
});

app.get('/explorar', (_req, res) => {
    res.sendFile(path.join(__dirname, '../../src/pages/user/explorar.html'));
});


app.get('/professor', (_req, res) => {
    res.sendFile(path.join(__dirname, '../../src/pages/professor/indexProfessor.html'));
});

app.get('/criarCurso', (_req, res) => {
    res.sendFile(path.join(__dirname, '../../src/pages/professor/criar-curso.html'));
});


app.get('/admin', (_req, res) => {
    res.sendFile(path.join(__dirname, '../../src/pages/admin/admin-cursoativo.html'));
});

app.get('/admin-cursos', (_req, res) => {
    res.sendFile(path.join(__dirname, '../../src/pages/admin/admin-cursoativo.html'));
});

app.get('/admin-reportes', (_req, res) => {
    res.sendFile(path.join(__dirname, '../../src/pages/admin/admin-reporte.html'));
});

app.get('/admin-solicitacoes', (_req, res) => {
    res.sendFile(path.join(__dirname, '../../src/pages/admin/admin-solicitacao.html'));
});


app.get('/professor/curso-detalhes', (_req, res) => {
    res.sendFile(path.join(__dirname, '../../src/pages/professor/detalhes.html'));
});



// ✅ SUAS APIS
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/users', userRoutes);

// ✅ HEALTH CHECK
app.get('/api/health', (_req, res) => {
    res.json({ 
        message: 'API está funcionando!', 
        timestamp: new Date(),
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// ✅ ERROR HANDLER
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('💥 ERRO DETALHADO NO BACKEND:');
    console.error('💥 Mensagem:', err.message);
    console.error('💥 Stack:', err.stack);
    console.error('💥 Tipo:', err.name);
    
    res.status(500).json({ 
        message: 'Algo deu errado no servidor!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined,
        timestamp: new Date().toISOString()
    });
});


// Adicione isto ANTES das rotas no seu app.ts/index.ts
app.use('/api/courses', (req, _res, next) => {
    console.log('🎯 === ROTA COURSES DEBUG ===');
    console.log('📋 Método:', req.method);
    console.log('🔗 URL:', req.url);
    console.log('📍 Path:', req.path);
    console.log('🎯 Parâmetros:', req.params);
    console.log('📦 Body:', req.body);
    console.log('⏰ Timestamp:', new Date().toISOString());
    console.log('============================');
    next();
});


// Conexão com MongoDB
const connectDB = async () => {
    try {
        console.log('Conectando ao MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI!, {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
        });
        console.log('✅ Conectado ao MongoDB com sucesso!');
        
        // Iniciar servidor APÓS conexão com DB
        app.listen(PORT, () => {
            console.log(`🚀 Servidor rodando na porta ${PORT}`);
            console.log(`📚 Sistema Educacional - API Completa`);
            console.log(`📍 Frontend: http://localhost:${PORT}`);
            console.log(`📍 Página Inicial: http://localhost:${PORT}/`);
            console.log(`📍 Login: http://localhost:${PORT}/login`);
            console.log(`📍 Cadastro: http://localhost:${PORT}/cadastro`);
            console.log(`📍 Professor: http://localhost:${PORT}/professor`);
            console.log(`📍 Admin: http://localhost:${PORT}/admin`);
            console.log(`📍 API Health: http://localhost:${PORT}/api/health`);
            console.log(`🗄️  Database: ${mongoose.connection.readyState === 1 ? '✅ Conectado' : '❌ Desconectado'}`);
        });
    } catch (error) {
        console.error('❌ Erro ao conectar com MongoDB:', error);
        process.exit(1);
    }
};



// Conectar ao banco antes de iniciar o servidor
connectDB();