import { Response } from 'express';
import { Enrollment } from '../models/Enrollment';
import { Course } from '../models/Course';
import { AuthRequest } from '../middleware/auth';
import { UserRole } from '../models/User';

export const enrollInCourse = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        // Verificar se req.user existe
        if (!req.user) {
            return res.status(401).json({ message: 'Usuário não autenticado.' });
        }

        const { courseId } = req.params;
        
        // Apenas estudantes podem se matricular
        if (req.user.role !== UserRole.STUDENT) {
            return res.status(403).json({ message: 'Apenas estudantes podem se matricular.' });
        }

        const course = await Course.findById(courseId);
        if (!course || !course.isPublished) {
            return res.status(404).json({ message: 'Curso não disponível.' });
        }

        // Verificar se já está matriculado
        const existingEnrollment = await Enrollment.findOne({
            student: req.user.id,
            course: courseId
        });

        if (existingEnrollment) {
            return res.status(400).json({ message: 'Você já está matriculado neste curso.' });
        }

        const enrollment = new Enrollment({
            student: req.user.id,
            course: courseId
        });

        await enrollment.save();
        
        // Atualizar contador de estudantes no curso
        course.studentsEnrolled += 1;
        await course.save();

        await enrollment.populate('course', 'title instructor');
        return res.status(201).json(enrollment);
    } catch (error: any) {
        console.error('💥 ERRO AO REALIZAR MATRÍCULA:', error);
        return res.status(500).json({ 
            message: 'Erro ao realizar matrícula.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const getMyEnrollments = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        // Verificar se req.user existe
        if (!req.user) {
            return res.status(401).json({ message: 'Usuário não autenticado.' });
        }

        const enrollments = await Enrollment.find({ student: req.user.id })
            .populate({
                path: 'course',
                populate: { path: 'instructor', select: 'name' }
            })
            .sort({ enrolledAt: -1 });

        return res.json(enrollments);
    } catch (error: any) {
        console.error('💥 ERRO AO BUSCAR MATRÍCULAS:', error);
        return res.status(500).json({ 
            message: 'Erro ao buscar matrículas.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const getCourseEnrollments = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        // Verificar se req.user existe
        if (!req.user) {
            return res.status(401).json({ message: 'Usuário não autenticado.' });
        }

        const { courseId } = req.params;
        
        // Apenas admin ou o instrutor do curso pode ver as matrículas
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Curso não encontrado.' });
        }

        if (req.user.role !== UserRole.ADMIN && course.instructor.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Acesso negado.' });
        }

        const enrollments = await Enrollment.find({ course: courseId })
            .populate('student', 'name email')
            .sort({ enrolledAt: -1 });

        return res.json(enrollments);
    } catch (error: any) {
        console.error('💥 ERRO AO BUSCAR MATRÍCULAS DO CURSO:', error);
        return res.status(500).json({ 
            message: 'Erro ao buscar matrículas do curso.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Funções adicionais que podem ser úteis:
export const getEnrollmentById = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        // Verificar se req.user existe
        if (!req.user) {
            return res.status(401).json({ message: 'Usuário não autenticado.' });
        }

        const enrollment = await Enrollment.findById(req.params.id)
            .populate({
                path: 'course',
                populate: { path: 'instructor', select: 'name' }
            })
            .populate('student', 'name email');

        if (!enrollment) {
            return res.status(404).json({ message: 'Matrícula não encontrada.' });
        }

        // Verificar se o usuário tem acesso a esta matrícula
        const course = enrollment.course as any;
        if (req.user.role !== UserRole.ADMIN && 
            enrollment.student._id.toString() !== req.user.id && 
            course.instructor._id.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Acesso negado.' });
        }

        return res.json(enrollment);
    } catch (error: any) {
        console.error('💥 ERRO AO BUSCAR MATRÍCULA:', error);
        return res.status(500).json({ 
            message: 'Erro ao buscar matrícula.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const cancelEnrollment = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        // Verificar se req.user existe
        if (!req.user) {
            return res.status(401).json({ message: 'Usuário não autenticado.' });
        }

        const enrollment = await Enrollment.findById(req.params.id)
            .populate({
                path: 'course',
                populate: { path: 'instructor', select: 'name' }
            });

        if (!enrollment) {
            return res.status(404).json({ message: 'Matrícula não encontrada.' });
        }

        // Apenas o estudante, admin ou instrutor do curso pode cancelar
        const course = enrollment.course as any;
        if (req.user.role !== UserRole.ADMIN && 
            enrollment.student.toString() !== req.user.id && 
            course.instructor._id.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Acesso negado.' });
        }

        // Atualizar contador de estudantes no curso
        const courseToUpdate = await Course.findById(enrollment.course);
        if (courseToUpdate && courseToUpdate.studentsEnrolled > 0) {
            courseToUpdate.studentsEnrolled -= 1;
            await courseToUpdate.save();
        }

        await Enrollment.findByIdAndDelete(req.params.id);
        return res.json({ message: 'Matrícula cancelada com sucesso.' });
    } catch (error: any) {
        console.error('💥 ERRO AO CANCELAR MATRÍCULA:', error);
        return res.status(500).json({ 
            message: 'Erro ao cancelar matrícula.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};