import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

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

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:5500'],
    credentials: true
}));
app.use(express.json());

// ✅ CONEXÃO COM MONGODB
const connectDB = async () => {
    try {
        console.log('🔗 Conectando ao MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI!, {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
        });
        console.log('✅ Conectado ao MongoDB com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao conectar com MongoDB:', error);
        process.exit(1);
    }
};

// Conectar ao banco antes de iniciar o servidor
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/users', userRoutes);


app.get('/api/health', (_req, res) => {  // Use _req para indicar que não é usado
    res.json({ 
        message: 'API está funcionando!', 
        timestamp: new Date(),
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});


app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {  // Use _req e _next
    console.error(err.stack);
    res.status(500).json({ message: 'Algo deu errado!' });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📚 Sistema Educacional - API Completa`);
    console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🗄️  Database: ${mongoose.connection.readyState === 1 ? '✅ Conectado' : '❌ Desconectado'}`);
});