import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User, UserRole } from '../models/User';
import { hashPassword, comparePassword } from '../utils/passwordUtils';
import { AuthRequest } from '../middleware/auth';

export const register = async (req: Request, res: Response): Promise<Response> => {
    try {
        console.log('📝 Tentativa de registro:', req.body);

        const { name, email, password } = req.body;

        // Validações básicas
        if (!name || !email || !password) {
            console.log('❌ Dados incompletos:', { name, email, password: '***' });
            return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
        }

        // Verificar se usuário já existe
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('❌ Usuário já existe:', email);
            return res.status(400).json({ message: 'Usuário já existe.' });
        }

        console.log('🔐 Criptografando senha...');
        // Apenas estudantes podem se cadastrar
        const hashedPassword = await hashPassword(password);

        // No authController.ts, na função register:
        const user = new User({
            name,
            email,
            password: hashedPassword,
            role: UserRole.STUDENT // Continua STUDENT para cadastro público
        });

        console.log('💾 Salvando usuário...');
        await user.save();
        console.log('✅ Usuário salvo com ID:', user._id);

        // Gerar token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || 'fallback_secret_super_seguro_123',
            { expiresIn: '7d' }
        );

        console.log('🎉 Registro concluído para:', email);
        return res.status(201).json({
            message: 'Usuário criado com sucesso!',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error: any) {
        console.error('💥 ERRO NO REGISTRO:', error);
        return res.status(500).json({
            message: 'Erro no servidor.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const login = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { email, password } = req.body;

        // Verificar usuário
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Credenciais inválidas.' });
        }

        // Verificar senha
        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Credenciais inválidas.' });
        }

        // Gerar token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || 'fallback_secret_super_seguro_123',
            { expiresIn: '7d' }
        );

        return res.json({
            message: 'Login realizado com sucesso!',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error: any) {
        console.error('💥 ERRO NO LOGIN:', error);
        return res.status(500).json({
            message: 'Erro no servidor.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        // Verificar se req.user existe
        if (!req.user) {
            return res.status(401).json({ message: 'Usuário não autenticado.' });
        }

        const user = await User.findById(req.user.id).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        return res.json(user);
    } catch (error: any) {
        console.error('💥 ERRO NO GETME:', error);
        return res.status(500).json({
            message: 'Erro no servidor.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};