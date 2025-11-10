import { Response } from 'express';
import { Activity } from '../models/Activity';
import { Lesson } from '../models/Lesson';
import { Course } from '../models/Course';
import { AuthRequest } from '../middleware/auth';
import { UserRole } from '../models/User';

export const getActivities = async (req: AuthRequest, res: Response): Promise<Response> => {
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
        if (req.user.role === UserRole.STUDENT && !course?.isPublished) {
            return res.status(403).json({ message: 'Acesso negado.' });
        }

        const activities = await Activity.find({ lesson: lessonId })
            .populate('submissions')
            .sort({ createdAt: -1 });

        return res.json(activities);
    } catch (error: any) {
        console.error('💥 ERRO AO BUSCAR ATIVIDADES:', error);
        return res.status(500).json({ 
            message: 'Erro ao buscar atividades.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const createActivity = async (req: AuthRequest, res: Response): Promise<Response> => {
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

        const activity = new Activity({
            ...req.body,
            lesson: lessonId
        });

        await activity.save();
        return res.status(201).json(activity);
    } catch (error: any) {
        console.error('💥 ERRO AO CRIAR ATIVIDADE:', error);
        return res.status(500).json({ 
            message: 'Erro ao criar atividade.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Funções adicionais que você provavelmente vai precisar:
export const getActivityById = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        // Verificar se req.user existe
        if (!req.user) {
            return res.status(401).json({ message: 'Usuário não autenticado.' });
        }

        const activity = await Activity.findById(req.params.id).populate('lesson');
        
        if (!activity) {
            return res.status(404).json({ message: 'Atividade não encontrada.' });
        }

        const lesson = await Lesson.findById(activity.lesson).populate('course');
        if (!lesson) {
            return res.status(404).json({ message: 'Aula não encontrada.' });
        }

        const course = await Course.findById(lesson.course);
        if (req.user.role === UserRole.STUDENT && !course?.isPublished) {
            return res.status(403).json({ message: 'Acesso negado.' });
        }

        return res.json(activity);
    } catch (error: any) {
        console.error('💥 ERRO AO BUSCAR ATIVIDADE:', error);
        return res.status(500).json({ 
            message: 'Erro ao buscar atividade.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const updateActivity = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        // Verificar se req.user existe
        if (!req.user) {
            return res.status(401).json({ message: 'Usuário não autenticado.' });
        }

        const activity = await Activity.findById(req.params.id).populate('lesson');
        
        if (!activity) {
            return res.status(404).json({ message: 'Atividade não encontrada.' });
        }

        const lesson = await Lesson.findById(activity.lesson).populate('course');
        if (!lesson) {
            return res.status(404).json({ message: 'Aula não encontrada.' });
        }

        const course = await Course.findById(lesson.course);
        if (req.user.role !== UserRole.ADMIN && course?.instructor.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Acesso negado.' });
        }

        const updatedActivity = await Activity.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        return res.json(updatedActivity);
    } catch (error: any) {
        console.error('💥 ERRO AO ATUALIZAR ATIVIDADE:', error);
        return res.status(500).json({ 
            message: 'Erro ao atualizar atividade.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const deleteActivity = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        // Verificar se req.user existe
        if (!req.user) {
            return res.status(401).json({ message: 'Usuário não autenticado.' });
        }

        const activity = await Activity.findById(req.params.id).populate('lesson');
        
        if (!activity) {
            return res.status(404).json({ message: 'Atividade não encontrada.' });
        }

        const lesson = await Lesson.findById(activity.lesson).populate('course');
        if (!lesson) {
            return res.status(404).json({ message: 'Aula não encontrada.' });
        }

        const course = await Course.findById(lesson.course);
        if (req.user.role !== UserRole.ADMIN && course?.instructor.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Acesso negado.' });
        }

        await Activity.findByIdAndDelete(req.params.id);
        return res.json({ message: 'Atividade deletada com sucesso.' });
    } catch (error: any) {
        console.error('💥 ERRO AO DELETAR ATIVIDADE:', error);
        return res.status(500).json({ 
            message: 'Erro ao deletar atividade.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};