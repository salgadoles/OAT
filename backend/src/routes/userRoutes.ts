import express from 'express';
import { getUsers } from '../controllers/userController';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roleAuth';
import { UserRole } from '../models/User';

const router = express.Router();

// Rota para buscar usuários (com filtro opcional por role)
router.get('/', authenticate, requireRole([UserRole.ADMIN, UserRole.PROFESSOR]), getUsers);

export default router;