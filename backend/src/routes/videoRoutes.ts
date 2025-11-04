import { Router } from 'express';
import { 
    getVideos, 
    createVideo, 
    getVideoById, 
    updateVideo, 
    deleteVideo 
} from '../controllers/videoController';
import { authenticate, requireRole } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = Router();

router.get('/lesson/:lessonId', authenticate, getVideos);
router.get('/:id', authenticate, getVideoById);
router.post('/lesson/:lessonId', authenticate, requireRole([UserRole.ADMIN, UserRole.PROFESSOR]), createVideo);
router.put('/:id', authenticate, requireRole([UserRole.ADMIN, UserRole.PROFESSOR]), updateVideo);
router.delete('/:id', authenticate, requireRole([UserRole.ADMIN, UserRole.PROFESSOR]), deleteVideo);

export default router;