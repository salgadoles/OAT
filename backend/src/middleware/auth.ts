import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { UserRole } from '../models/User'; // Adicione esta importação

export interface AuthRequest extends Request {
    user?: {
        id: string;
        role: UserRole; // Mude de string para UserRole
    };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            res.status(401).json({ message: 'Token de acesso não fornecido.' });
            return;
        }

        const decoded = jwt.verify(
            token, 
            process.env.JWT_SECRET || 'fallback_secret_super_seguro_123'
        ) as { id: string; role: UserRole }; // Mude para UserRole

        // Verificar se usuário ainda existe
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            res.status(401).json({ message: 'Token inválido. Usuário não encontrado.' });
            return;
        }

        // Garantir que o user está definido
        req.user = {
            id: user._id.toString(),
            role: user.role
        };

        next();
    } catch (error) {
        console.error('💥 ERRO NA AUTENTICAÇÃO:', error);
        res.status(401).json({ message: 'Token inválido.' });
        return;
    }
};

// Middleware para verificar roles específicos
export const requireRole = (roles: UserRole[]) => { // Mude para UserRole[]
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ message: 'Usuário não autenticado.' });
            return;
        }

        if (!roles.includes(req.user.role)) {
            res.status(403).json({ 
                message: 'Acesso negado. Permissões insuficientes.',
                requiredRoles: roles,
                userRole: req.user.role
            });
            return;
        }

        next();
    };
};