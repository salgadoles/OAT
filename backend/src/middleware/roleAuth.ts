import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { UserRole } from '../models/User';

export const requireRole = (roles: UserRole[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        // Verificar se req.user existe
        if (!req.user) {
            res.status(401).json({ message: 'Usuário não autenticado.' });
            return;
        }

        // Verificar se o role do usuário está na lista de roles permitidos
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