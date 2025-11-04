// src/routes/enrollmentRoutes.ts
import { Router } from 'express';
import { 
    enrollInCourse, 
    getMyEnrollments, 
    getCourseEnrollments,
    getEnrollmentById,
    cancelEnrollment
} from '../controllers/enrollmentController';
import { authenticate, requireRole } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = Router();

router.post('/course/:courseId', authenticate, enrollInCourse);
router.get('/my-enrollments', authenticate, getMyEnrollments);
router.get('/course/:courseId', authenticate, requireRole([UserRole.ADMIN, UserRole.PROFESSOR]), getCourseEnrollments);
router.get('/:id', authenticate, getEnrollmentById);
router.delete('/:id', authenticate, cancelEnrollment);

export default router;