import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { UserRole } from '../models/User';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        role: UserRole;
    };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        console.log('🛡️  === INICIANDO MIDDLEWARE DE AUTENTICAÇÃO ===');
        
        // 1. Verificar header Authorization
        const authHeader = req.header('Authorization');
        console.log('📨 Header Authorization recebido:', authHeader);
        
        if (!authHeader) {
            console.log('❌ Header Authorization não encontrado');
            console.log('📋 Todos os headers recebidos:', req.headers);
            res.status(401).json({ message: 'Token de acesso não fornecido.' });
            return;
        }

        // 2. Extrair token
        const token = authHeader.replace('Bearer ', '');
        console.log('🔑 Token extraído (primeiros 20 chars):', token.substring(0, 20) + '...');
        
        if (!token) {
            console.log('❌ Token não encontrado no header');
            res.status(401).json({ message: 'Token de acesso não fornecido.' });
            return;
        }

        // 3. Verificar JWT
        console.log('🔍 Verificando token JWT...');
        const decoded = jwt.verify(
            token, 
            process.env.JWT_SECRET || 'fallback_secret_super_seguro_123'
        ) as { id: string; role: UserRole };

        console.log('✅ Token JWT válido. Payload:', decoded);

        // 4. Verificar se usuário existe no banco
        console.log('👤 Buscando usuário no banco com ID:', decoded.id);
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
            console.log('❌ Usuário não encontrado no banco de dados');
            res.status(401).json({ message: 'Token inválido. Usuário não encontrado.' });
            return;
        }

        console.log('✅ Usuário encontrado no banco:', {
            id: user._id.toString(),
            name: user.name,
            role: user.role,
            email: user.email
        });

        // 5. Definir usuário na request
        req.user = {
            id: user._id.toString(),
            role: user.role
        };

        console.log('🎯 req.user definido com sucesso:', req.user);
        console.log('🛡️  === AUTENTICAÇÃO CONCLUÍDA ===');
        
        next();
        
    } catch (error) {
        console.error('💥 ERRO NA AUTENTICAÇÃO:', error);
        
        if (error instanceof jwt.JsonWebTokenError) {
            console.error('❌ Erro específico do JWT:', error.message);
            res.status(401).json({ message: 'Token JWT inválido.' });
        } else if (error instanceof jwt.TokenExpiredError) {
            console.error('❌ Token expirado');
            res.status(401).json({ message: 'Token expirado.' });
        } else {
            res.status(401).json({ message: 'Token inválido.' });
        }
        return;
    }
};

// Middleware para verificar roles específicos
export const requireRole = (roles: UserRole[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        console.log('👮 === VERIFICANDO PERMISSÕES ===');
        console.log('👤 Usuário atual:', req.user);
        console.log('🎯 Roles permitidas:', roles);
        
        if (!req.user) {
            console.log('❌ Usuário não autenticado no requireRole');
            res.status(401).json({ message: 'Usuário não autenticado.' });
            return;
        }

        console.log('🔍 Verificando role do usuário:', req.user.role);
        
        if (!roles.includes(req.user.role)) {
            console.log('❌ Acesso negado. Role do usuário não permitida');
            res.status(403).json({ 
                message: 'Acesso negado. Permissões insuficientes.',
                requiredRoles: roles,
                userRole: req.user.role
            });
            return;
        }

        console.log('✅ Permissões concedidas');
        console.log('👮 === VERIFICAÇÃO DE PERMISSÕES CONCLUÍDA ===');
        next();
    };
};