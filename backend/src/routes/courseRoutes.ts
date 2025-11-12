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
    getPendingCourses,
    getInstructorCourses,
    // NOVAS FUNÇÕES PARA VÍDEOS
    getCourseVideos,
    addVideoToCourse,
    updateVideo,
    deleteVideo,
    // NOVAS FUNÇÕES PARA ATIVIDADES
    getCourseActivities,
    addActivityToCourse,
    updateActivity,
    deleteActivity,
    // NOVAS FUNÇÕES PARA ALUNOS
    getCourseStudents,
    getCourseAnalytics
} from '../controllers/courseController';
import { authenticate, requireRole } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = Router();

// Rotas públicas
router.get('/', authenticate, getCourses);
router.get('/:id', authenticate, getCourseById);

// Rotas do professor
router.get('/instructor/my-courses', authenticate, requireRole([UserRole.PROFESSOR]), getInstructorCourses);
router.post('/', authenticate, requireRole([UserRole.ADMIN, UserRole.PROFESSOR]), createCourse);
router.put('/:id', authenticate, requireRole([UserRole.ADMIN, UserRole.PROFESSOR]), updateCourse);
router.post('/:id/submit', authenticate, requireRole([UserRole.PROFESSOR]), submitForApproval);

// Rotas do admin
router.delete('/:id', authenticate, requireRole([UserRole.ADMIN]), deleteCourse);
router.get('/admin/pending', authenticate, requireRole([UserRole.ADMIN]), getPendingCourses);
router.post('/:id/approve', authenticate, requireRole([UserRole.ADMIN]), approveCourse);
router.post('/:id/reject', authenticate, requireRole([UserRole.ADMIN]), rejectCourse);
router.patch('/:id/publish', authenticate, requireRole([UserRole.ADMIN]), publishCourse);

// ==================== NOVAS ROTAS PARA VÍDEOS ====================
router.get('/:courseId/videos', authenticate, getCourseVideos);
router.post('/:courseId/videos', authenticate, requireRole([UserRole.ADMIN, UserRole.PROFESSOR]), addVideoToCourse);
router.put('/:courseId/videos/:videoId', authenticate, requireRole([UserRole.ADMIN, UserRole.PROFESSOR]), updateVideo);
router.delete('/:courseId/videos/:videoId', authenticate, requireRole([UserRole.ADMIN, UserRole.PROFESSOR]), deleteVideo);

// ==================== NOVAS ROTAS PARA ATIVIDADES ====================
router.get('/:courseId/activities', authenticate, getCourseActivities);
router.post('/:courseId/activities', authenticate, requireRole([UserRole.ADMIN, UserRole.PROFESSOR]), addActivityToCourse);
router.put('/:courseId/activities/:activityId', authenticate, requireRole([UserRole.ADMIN, UserRole.PROFESSOR]), updateActivity);
router.delete('/:courseId/activities/:activityId', authenticate, requireRole([UserRole.ADMIN, UserRole.PROFESSOR]), deleteActivity);

// ==================== NOVAS ROTAS PARA ALUNOS E ANALYTICS ====================
router.get('/:courseId/students', authenticate, getCourseStudents);
router.get('/:courseId/analytics', authenticate, getCourseAnalytics);

export default router;