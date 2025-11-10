import express from 'express';
import { 
    getUsers, 
    getUserById, 
    updateUser, 
    deleteUser 
} from '../controllers/userController';
import { authenticate, requireRole } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = express.Router();

// Todas as rotas precisam de autenticação
router.use(authenticate);

// Apenas admin pode listar todos usuários
router.get('/', requireRole([UserRole.ADMIN]), getUsers);

// Admin ou próprio usuário pode ver perfil
router.get('/:id', getUserById);

// Admin ou próprio usuário pode atualizar
router.put('/:id', updateUser);

// Apenas admin pode deletar
router.delete('/:id', requireRole([UserRole.ADMIN]), deleteUser);

export default router;