import { Response } from 'express';
import { User } from '../models/User'; // Remova UserRole
import { AuthRequest } from '../middleware/auth';

export const getUsers = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        // Verificar se req.user existe
        if (!req.user) {
            return res.status(401).json({ message: 'Usuário não autenticado.' });
        }

        // Apenas admin pode ver todos os usuários
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Acesso negado.' });
        }

        const users = await User.find().select('-password');
        return res.json(users);
    } catch (error: any) {
        console.error('💥 ERRO AO BUSCAR USUÁRIOS:', error);
        return res.status(500).json({ 
            message: 'Erro ao buscar usuários.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const getUserById = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        // Verificar se req.user existe
        if (!req.user) {
            return res.status(401).json({ message: 'Usuário não autenticado.' });
        }

        const user = await User.findById(req.params.id).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        // Apenas admin ou o próprio usuário pode ver os dados
        if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
            return res.status(403).json({ message: 'Acesso negado.' });
        }

        return res.json(user);
    } catch (error: any) {
        console.error('💥 ERRO AO BUSCAR USUÁRIO:', error);
        return res.status(500).json({ 
            message: 'Erro ao buscar usuário.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const updateUser = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        // Verificar se req.user existe
        if (!req.user) {
            return res.status(401).json({ message: 'Usuário não autenticado.' });
        }

        // Apenas admin ou o próprio usuário pode atualizar
        if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
            return res.status(403).json({ message: 'Acesso negado.' });
        }

        // Remover campos que não podem ser atualizados
        const { password, role, ...updateData } = req.body;

        // Apenas admin pode alterar role
        if (req.user.role !== 'admin' && role) {
            return res.status(403).json({ message: 'Apenas administradores podem alterar permissões.' });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        return res.json(user);
    } catch (error: any) {
        console.error('💥 ERRO AO ATUALIZAR USUÁRIO:', error);
        return res.status(500).json({ 
            message: 'Erro ao atualizar usuário.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const deleteUser = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        // Verificar se req.user existe
        if (!req.user) {
            return res.status(401).json({ message: 'Usuário não autenticado.' });
        }

        // Apenas admin pode deletar usuários
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Acesso negado.' });
        }

        const user = await User.findByIdAndDelete(req.params.id);
        
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        return res.json({ message: 'Usuário deletado com sucesso.' });
    } catch (error: any) {
        console.error('💥 ERRO AO DELETAR USUÁRIO:', error);
        return res.status(500).json({ 
            message: 'Erro ao deletar usuário.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};