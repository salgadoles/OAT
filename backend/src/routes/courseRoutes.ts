// src/routes/courseRoutes.ts
import { Router } from 'express';
import { 
    createCourse, 
    updateCourse, 
    getCourses, 
    getCourseById,
    deleteCourse,
    publishCourse,
    submitForApproval,
    approveCourse,
    rejectCourse,
    getPendingCourses
} from '../controllers/courseController';
import { authenticate, requireRole } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = Router();

// Rotas públicas
router.get('/', getCourses);
router.get('/:id', getCourseById);

// Rotas protegidas
router.post('/', authenticate, requireRole([UserRole.ADMIN, UserRole.PROFESSOR]), createCourse);
router.put('/:id', authenticate, requireRole([UserRole.ADMIN, UserRole.PROFESSOR]), updateCourse);
router.delete('/:id', authenticate, requireRole([UserRole.ADMIN]), deleteCourse);

// 🔄 NOVAS ROTAS PARA SISTEMA DE APROVAÇÃO

// Professor submete curso para aprovação
router.post('/:id/submit', authenticate, requireRole([UserRole.PROFESSOR]), submitForApproval);

// Admin gerencia aprovações
router.get('/admin/pending', authenticate, requireRole([UserRole.ADMIN]), getPendingCourses);
router.post('/:id/approve', authenticate, requireRole([UserRole.ADMIN]), approveCourse);
router.post('/:id/reject', authenticate, requireRole([UserRole.ADMIN]), rejectCourse);

// Admin publica curso (agora separado da aprovação)
router.patch('/:id/publish', authenticate, requireRole([UserRole.ADMIN]), publishCourse);

export default router;