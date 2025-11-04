import { Response } from 'express';
import { Lesson } from '../models/Lesson';
import { Course } from '../models/Course';
import { AuthRequest } from '../middleware/auth';
import { UserRole } from '../models/User';

export const getLessons = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        // Verificar se req.user existe
        if (!req.user) {
            return res.status(401).json({ message: 'Usuário não autenticado.' });
        }

        const { courseId } = req.params;
        
        // Verificar se o curso existe e se o usuário tem acesso
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Curso não encontrado.' });
        }

        // Estudantes só podem ver aulas de cursos publicados
        if (req.user.role === UserRole.STUDENT && !course.isPublished) {
            return res.status(403).json({ message: 'Acesso negado.' });
        }

        const lessons = await Lesson.find({ course: courseId })
            .populate('videos')
            .populate('activities')
            .sort({ order: 1 });

        return res.json(lessons);
    } catch (error: any) {
        console.error('💥 ERRO AO BUSCAR AULAS:', error);
        return res.status(500).json({ 
            message: 'Erro ao buscar aulas.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const getLessonById = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        // Verificar se req.user existe
        if (!req.user) {
            return res.status(401).json({ message: 'Usuário não autenticado.' });
        }

        const lesson = await Lesson.findById(req.params.id)
            .populate('videos')
            .populate('activities')
            .populate('course');

        if (!lesson) {
            return res.status(404).json({ message: 'Aula não encontrada.' });
        }

        // Verificar acesso ao curso
        const course = await Course.findById(lesson.course);
        if (req.user.role === UserRole.STUDENT && !course?.isPublished) {
            return res.status(403).json({ message: 'Acesso negado.' });
        }

        return res.json(lesson);
    } catch (error: any) {
        console.error('💥 ERRO AO BUSCAR AULA:', error);
        return res.status(500).json({ 
            message: 'Erro ao buscar aula.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const createLesson = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        // Verificar se req.user existe
        if (!req.user) {
            return res.status(401).json({ message: 'Usuário não autenticado.' });
        }

        const { courseId } = req.params;
        
        // Verificar se o usuário pode criar aulas neste curso
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Curso não encontrado.' });
        }

        if (req.user.role !== UserRole.ADMIN && course.instructor.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Acesso negado.' });
        }

        const lesson = new Lesson({
            ...req.body,
            course: courseId
        });

        await lesson.save();
        await lesson.populate('videos activities');
        
        return res.status(201).json(lesson);
    } catch (error: any) {
        console.error('💥 ERRO AO CRIAR AULA:', error);
        return res.status(500).json({ 
            message: 'Erro ao criar aula.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const updateLesson = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        // Verificar se req.user existe
        if (!req.user) {
            return res.status(401).json({ message: 'Usuário não autenticado.' });
        }

        const lesson = await Lesson.findById(req.params.id).populate('course');
        
        if (!lesson) {
            return res.status(404).json({ message: 'Aula não encontrada.' });
        }

        const course = await Course.findById(lesson.course);
        if (!course) {
            return res.status(404).json({ message: 'Curso não encontrado.' });
        }

        // Apenas admin ou o instrutor do curso pode editar
        if (req.user.role !== UserRole.ADMIN && course.instructor.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Acesso negado.' });
        }

        const updatedLesson = await Lesson.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('videos activities');

        return res.json(updatedLesson);
    } catch (error: any) {
        console.error('💥 ERRO AO ATUALIZAR AULA:', error);
        return res.status(500).json({ 
            message: 'Erro ao atualizar aula.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const deleteLesson = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        // Verificar se req.user existe
        if (!req.user) {
            return res.status(401).json({ message: 'Usuário não autenticado.' });
        }

        const lesson = await Lesson.findById(req.params.id).populate('course');
        
        if (!lesson) {
            return res.status(404).json({ message: 'Aula não encontrada.' });
        }

        const course = await Course.findById(lesson.course);
        if (!course) {
            return res.status(404).json({ message: 'Curso não encontrado.' });
        }

        // Apenas admin pode deletar aulas
        if (req.user.role !== UserRole.ADMIN) {
            return res.status(403).json({ message: 'Acesso negado.' });
        }

        await Lesson.findByIdAndDelete(req.params.id);
        return res.json({ message: 'Aula deletada com sucesso.' });
    } catch (error: any) {
        console.error('💥 ERRO AO DELETAR AULA:', error);
        return res.status(500).json({ 
            message: 'Erro ao deletar aula.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};