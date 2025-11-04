// src/routes/courseRoutes.ts
import { Router } from 'express';
import { 
    createCourse, 
    updateCourse, 
    getCourses, 
    getCourseById,
    deleteCourse,
    publishCourse 
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
router.patch('/:id/publish', authenticate, requireRole([UserRole.ADMIN]), publishCourse);

export default router;