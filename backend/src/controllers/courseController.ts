import { Response } from 'express';
import { Course } from '../models/Course';
import { AuthRequest } from '../middleware/auth';
import { UserRole } from '../models/User';

export const getCourses = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        // Verificar se req.user existe
        if (!req.user) {
            return res.status(401).json({ message: 'Usuário não autenticado.' });
        }

        const { role } = req.user;
        let courses;

        if (role === UserRole.STUDENT) {
            courses = await Course.find({ isPublished: true })
                .populate('instructor', 'name email')
                .select('-requirements -learningObjectives');
        } else {
            courses = await Course.find()
                .populate('instructor', 'name email');
        }

        return res.json(courses);
    } catch (error: any) {
        console.error('💥 ERRO AO BUSCAR CURSOS:', error);
        return res.status(500).json({ 
            message: 'Erro no servidor.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const getCourseById = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        // Verificar se req.user existe
        if (!req.user) {
            return res.status(401).json({ message: 'Usuário não autenticado.' });
        }

        const course = await Course.findById(req.params.id)
            .populate('instructor', 'name email');
        
        if (!course) {
            return res.status(404).json({ message: 'Curso não encontrado.' });
        }

        // Estudantes só podem ver cursos publicados
        if (req.user.role === UserRole.STUDENT && !course.isPublished) {
            return res.status(403).json({ message: 'Acesso negado.' });
        }

        return res.json(course);
    } catch (error: any) {
        console.error('💥 ERRO AO BUSCAR CURSO:', error);
        return res.status(500).json({ 
            message: 'Erro no servidor.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const createCourse = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        // Verificar se req.user existe
        if (!req.user) {
            return res.status(401).json({ message: 'Usuário não autenticado.' });
        }

        const {
            title,
            description,
            thumbnail,
            price,
            category,
            level,
            duration,
            requirements,
            learningObjectives
        } = req.body;

        // Se for professor, ele é automaticamente o instrutor
        // Se for admin, pode definir outro instrutor
        const instructor = req.user.role === UserRole.PROFESSOR ? req.user.id : req.body.instructor;

        // Professores não podem publicar cursos diretamente nem definir preço alto
        const isPublished = req.user.role === UserRole.PROFESSOR ? false : req.body.isPublished;
        const finalPrice = req.user.role === UserRole.PROFESSOR ? Math.min(price || 0, 100) : price; // Limite de preço para professores

        const course = new Course({
            title,
            description,
            thumbnail,
            price: finalPrice,
            category,
            level,
            duration,
            requirements: requirements || [],
            learningObjectives: learningObjectives || [],
            instructor,
            isPublished
        });

        await course.save();
        await course.populate('instructor', 'name email');

        return res.status(201).json({
            message: 'Curso criado com sucesso!',
            course
        });
    } catch (error: any) {
        console.error('💥 ERRO AO CRIAR CURSO:', error);
        return res.status(500).json({ 
            message: 'Erro no servidor.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const updateCourse = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        // Verificar se req.user existe
        if (!req.user) {
            return res.status(401).json({ message: 'Usuário não autenticado.' });
        }

        const course = await Course.findById(req.params.id);
        
        if (!course) {
            return res.status(404).json({ message: 'Curso não encontrado.' });
        }

        // Apenas admin ou o instrutor do curso pode editar
        if (req.user.role !== UserRole.ADMIN && course.instructor.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Acesso negado.' });
        }

        // Professores não podem publicar cursos nem alterar preço acima do limite
        if (req.user.role === UserRole.PROFESSOR) {
            if (req.body.isPublished !== undefined) {
                delete req.body.isPublished; // Professores não podem publicar
            }
            if (req.body.price !== undefined && req.body.price > 100) {
                req.body.price = 100; // Limite de preço para professores
            }
        }

        const updatedCourse = await Course.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('instructor', 'name email');

        return res.json({
            message: 'Curso atualizado com sucesso!',
            course: updatedCourse
        });
    } catch (error: any) {
        console.error('💥 ERRO AO ATUALIZAR CURSO:', error);
        return res.status(500).json({ 
            message: 'Erro no servidor.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const deleteCourse = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        // Verificar se req.user existe
        if (!req.user) {
            return res.status(401).json({ message: 'Usuário não autenticado.' });
        }

        const course = await Course.findById(req.params.id);
        
        if (!course) {
            return res.status(404).json({ message: 'Curso não encontrado.' });
        }

        // Apenas admin pode deletar cursos
        if (req.user.role !== UserRole.ADMIN) {
            return res.status(403).json({ message: 'Acesso negado. Apenas administradores podem deletar cursos.' });
        }

        await Course.findByIdAndDelete(req.params.id);

        return res.json({ message: 'Curso deletado com sucesso!' });
    } catch (error: any) {
        console.error('💥 ERRO AO DELETAR CURSO:', error);
        return res.status(500).json({ 
            message: 'Erro no servidor.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Função adicional para publicar curso (apenas admin)
export const publishCourse = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Usuário não autenticado.' });
        }

        if (req.user.role !== UserRole.ADMIN) {
            return res.status(403).json({ message: 'Acesso negado. Apenas administradores podem publicar cursos.' });
        }

        const course = await Course.findByIdAndUpdate(
            req.params.id,
            { isPublished: true },
            { new: true }
        ).populate('instructor', 'name email');

        if (!course) {
            return res.status(404).json({ message: 'Curso não encontrado.' });
        }

        return res.json({
            message: 'Curso publicado com sucesso!',
            course
        });
    } catch (error: any) {
        console.error('💥 ERRO AO PUBLICAR CURSO:', error);
        return res.status(500).json({ 
            message: 'Erro no servidor.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};