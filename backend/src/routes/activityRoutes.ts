import express from 'express';
import { 
    getActivities, 
    createActivity, 
    getActivityById, 
    updateActivity, 
    deleteActivity 
} from '../controllers/activityController';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roleAuth';
import { UserRole } from '../models/User';

const router = express.Router();

router.get('/lesson/:lessonId', authenticate, getActivities);
router.get('/:id', authenticate, getActivityById);
router.post('/lesson/:lessonId', authenticate, requireRole([UserRole.ADMIN, UserRole.PROFESSOR]), createActivity);
router.put('/:id', authenticate, requireRole([UserRole.ADMIN, UserRole.PROFESSOR]), updateActivity);
router.delete('/:id', authenticate, requireRole([UserRole.ADMIN, UserRole.PROFESSOR]), deleteActivity);

export default router;