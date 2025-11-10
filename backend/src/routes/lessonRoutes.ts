import { Router } from 'express';
import { 
    createLesson, 
    updateLesson, 
    getLessons, 
    getLessonById,
    deleteLesson 
} from '../controllers/lessonController';
import { authenticate, requireRole } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = Router();

// Rotas públicas (para cursos publicados)
router.get('/course/:courseId', getLessons);
router.get('/:id', getLessonById);

// Rotas protegidas - apenas admin e professor
router.post('/course/:courseId', authenticate, requireRole([UserRole.ADMIN, UserRole.PROFESSOR]), createLesson);
router.put('/:id', authenticate, requireRole([UserRole.ADMIN, UserRole.PROFESSOR]), updateLesson);
router.delete('/:id', authenticate, requireRole([UserRole.ADMIN, UserRole.PROFESSOR]), deleteLesson);

export default router;