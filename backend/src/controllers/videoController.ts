import { Response } from 'express';
import { Video } from '../models/Video';
import { Lesson } from '../models/Lesson';
import { Course } from '../models/Course';
import { AuthRequest } from '../middleware/auth';
import { UserRole } from '../models/User';

export const getVideos = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        // Verificar se req.user existe
        if (!req.user) {
            return res.status(401).json({ message: 'Usuário não autenticado.' });
        }

        const { lessonId } = req.params;
        
        const lesson = await Lesson.findById(lessonId).populate('course');
        if (!lesson) {
            return res.status(404).json({ message: 'Aula não encontrada.' });
        }

        // Verificar acesso
        const course = await Course.findById(lesson.course);
        if (req.user.role === UserRole.STUDENT && !course?.isPublished) {
            return res.status(403).json({ message: 'Acesso negado.' });
        }

        const videos = await Video.find({ lesson: lessonId }).sort({ order: 1 });
        return res.json(videos);
    } catch (error: any) {
        console.error('💥 ERRO AO BUSCAR VÍDEOS:', error);
        return res.status(500).json({ 
            message: 'Erro ao buscar vídeos.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const createVideo = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        // Verificar se req.user existe
        if (!req.user) {
            return res.status(401).json({ message: 'Usuário não autenticado.' });
        }

        const { lessonId } = req.params;
        
        const lesson = await Lesson.findById(lessonId).populate('course');
        if (!lesson) {
            return res.status(404).json({ message: 'Aula não encontrada.' });
        }

        const course = await Course.findById(lesson.course);
        if (req.user.role !== UserRole.ADMIN && course?.instructor.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Acesso negado.' });
        }

        const video = new Video({
            ...req.body,
            lesson: lessonId
        });

        await video.save();
        return res.status(201).json(video);
    } catch (error: any) {
        console.error('💥 ERRO AO CRIAR VÍDEO:', error);
        return res.status(500).json({ 
            message: 'Erro ao criar vídeo.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const getVideoById = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        // Verificar se req.user existe
        if (!req.user) {
            return res.status(401).json({ message: 'Usuário não autenticado.' });
        }

        const video = await Video.findById(req.params.id).populate('lesson');
        
        if (!video) {
            return res.status(404).json({ message: 'Vídeo não encontrado.' });
        }

        // Verificar acesso através da aula e curso
        const lesson = await Lesson.findById(video.lesson).populate('course');
        if (!lesson) {
            return res.status(404).json({ message: 'Aula não encontrada.' });
        }

        const course = await Course.findById(lesson.course);
        if (req.user.role === UserRole.STUDENT && !course?.isPublished) {
            return res.status(403).json({ message: 'Acesso negado.' });
        }

        return res.json(video);
    } catch (error: any) {
        console.error('💥 ERRO AO BUSCAR VÍDEO:', error);
        return res.status(500).json({ 
            message: 'Erro ao buscar vídeo.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const updateVideo = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        // Verificar se req.user existe
        if (!req.user) {
            return res.status(401).json({ message: 'Usuário não autenticado.' });
        }

        const video = await Video.findById(req.params.id).populate('lesson');
        
        if (!video) {
            return res.status(404).json({ message: 'Vídeo não encontrado.' });
        }

        const lesson = await Lesson.findById(video.lesson).populate('course');
        if (!lesson) {
            return res.status(404).json({ message: 'Aula não encontrada.' });
        }

        const course = await Course.findById(lesson.course);
        if (req.user.role !== UserRole.ADMIN && course?.instructor.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Acesso negado.' });
        }

        const updatedVideo = await Video.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        return res.json(updatedVideo);
    } catch (error: any) {
        console.error('💥 ERRO AO ATUALIZAR VÍDEO:', error);
        return res.status(500).json({ 
            message: 'Erro ao atualizar vídeo.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const deleteVideo = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        // Verificar se req.user existe
        if (!req.user) {
            return res.status(401).json({ message: 'Usuário não autenticado.' });
        }

        const video = await Video.findById(req.params.id).populate('lesson');
        
        if (!video) {
            return res.status(404).json({ message: 'Vídeo não encontrado.' });
        }

        const lesson = await Lesson.findById(video.lesson).populate('course');
        if (!lesson) {
            return res.status(404).json({ message: 'Aula não encontrada.' });
        }

        const course = await Course.findById(lesson.course);
        if (req.user.role !== UserRole.ADMIN && course?.instructor.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Acesso negado.' });
        }

        await Video.findByIdAndDelete(req.params.id);
        return res.json({ message: 'Vídeo deletado com sucesso.' });
    } catch (error: any) {
        console.error('💥 ERRO AO DELETAR VÍDEO:', error);
        return res.status(500).json({ 
            message: 'Erro ao deletar vídeo.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};