import { Response } from 'express';
import { Course } from '../models/Course';
import { AuthRequest } from '../middleware/auth';
import { UserRole } from '../models/User';

export const getCourses = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        let courses;

        // Se usuário não está autenticado ou é estudante, mostra só cursos publicados
        if (!req.user || req.user.role === UserRole.STUDENT) {
            courses = await Course.find({ status: 'published' })
                .populate('instructor', 'name email')
                .select('-requirements -learningObjectives');
        } else if (req.user.role === UserRole.PROFESSOR) {
            // Professores veem seus próprios cursos
            courses = await Course.find({ instructor: req.user.id })
                .populate('instructor', 'name email');
        } else if (req.user.role === UserRole.ADMIN) {
            // Admin vê todos os cursos
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
        if (!req.user) {
            return res.status(401).json({ message: 'Usuário não autenticado.' });
        }

        const course = await Course.findById(req.params.id)
            .populate('instructor', 'name email');
        
        if (!course) {
            return res.status(404).json({ message: 'Curso não encontrado.' });
        }

        // Controle de acesso baseado no status
        if (req.user.role === UserRole.STUDENT && course.status !== 'published') {
            return res.status(403).json({ message: 'Acesso negado.' });
        }

        // Professores só podem ver seus próprios cursos (exceto se forem publicados)
        if (req.user.role === UserRole.PROFESSOR && 
            course.instructor._id.toString() !== req.user.id && 
            course.status !== 'published') {
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
        const instructor = req.user.role === UserRole.PROFESSOR ? req.user.id : req.body.instructor;

        // Professores criam como rascunho, admin pode criar como publicado
        const status = req.user.role === UserRole.PROFESSOR ? 'draft' : (req.body.status || 'draft');
        
        // Professores não podem publicar cursos diretamente nem definir preço alto
        const finalPrice = req.user.role === UserRole.PROFESSOR ? Math.min(price || 0, 100) : price;

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
            status,
            // Inicializa arrays vazios para vídeos e atividades
            videos: [],
            activities: []
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

        // Professores só podem editar cursos em rascunho ou rejeitados
        if (req.user.role === UserRole.PROFESSOR && 
            !['draft', 'rejected'].includes(course.status)) {
            return res.status(403).json({ 
                message: 'Curso não pode ser editado após submissão para aprovação.' 
            });
        }

        // Professores não podem alterar status diretamente (exceto para submitted)
        if (req.user.role === UserRole.PROFESSOR && req.body.status && req.body.status !== 'submitted') {
            delete req.body.status;
        }

        // Professores não podem publicar cursos nem alterar preço acima do limite
        if (req.user.role === UserRole.PROFESSOR) {
            if (req.body.price !== undefined && req.body.price > 100) {
                req.body.price = 100;
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
        if (!req.user) {
            return res.status(401).json({ message: 'Usuário não autenticado.' });
        }

        const course = await Course.findById(req.params.id);
        
        if (!course) {
            return res.status(404).json({ message: 'Curso não encontrado.' });
        }

        // Apenas admin pode deletar cursos, ou o professor se for rascunho
        if (req.user.role !== UserRole.ADMIN && 
            (course.instructor.toString() !== req.user.id || course.status !== 'draft')) {
            return res.status(403).json({ 
                message: 'Acesso negado. Apenas administradores podem deletar cursos ou professores podem deletar rascunhos.' 
            });
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


// Professor submete curso para aprovação
export const submitForApproval = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Usuário não autenticado.' });
        }

        const course = await Course.findById(req.params.id);
        
        if (!course) {
            return res.status(404).json({ message: 'Curso não encontrado.' });
        }

        // Apenas o instrutor pode submeter
        if (course.instructor.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Acesso negado.' });
        }

        // Verificar se o curso pode ser submetido
        if (course.status !== 'draft' && course.status !== 'rejected') {
            return res.status(400).json({ 
                message: 'Curso já foi submetido para aprovação.' 
            });
        }

        // Validações mínimas
        if (!course.videos || course.videos.length === 0) {
            return res.status(400).json({ 
                message: 'Adicione pelo menos um vídeo antes de enviar para aprovação.' 
            });
        }

        if (!course.description || !course.thumbnail) {
            return res.status(400).json({ 
                message: 'Complete a descrição e adicione uma thumbnail antes de enviar para aprovação.' 
            });
        }

        course.status = 'submitted';
        course.submittedAt = new Date();
        await course.save();

        return res.json({
            message: 'Curso enviado para aprovação com sucesso!',
            course
        });
    } catch (error: any) {
        console.error('💥 ERRO AO SUBMETER CURSO:', error);
        return res.status(500).json({ 
            message: 'Erro no servidor.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Admin aprova curso
export const approveCourse = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Usuário não autenticado.' });
        }

        if (req.user.role !== UserRole.ADMIN) {
            return res.status(403).json({ message: 'Acesso negado. Apenas administradores podem aprovar cursos.' });
        }

        const course = await Course.findByIdAndUpdate(
            req.params.id,
            { 
                status: 'approved',
                approvedAt: new Date(),
                approvedBy: req.user.id
            },
            { new: true }
        ).populate('instructor', 'name email');

        if (!course) {
            return res.status(404).json({ message: 'Curso não encontrado.' });
        }

        return res.json({
            message: 'Curso aprovado com sucesso!',
            course
        });
    } catch (error: any) {
        console.error('💥 ERRO AO APROVAR CURSO:', error);
        return res.status(500).json({ 
            message: 'Erro no servidor.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Admin rejeita curso
export const rejectCourse = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Usuário não autenticado.' });
        }

        if (req.user.role !== UserRole.ADMIN) {
            return res.status(403).json({ message: 'Acesso negado. Apenas administradores podem rejeitar cursos.' });
        }

        const { reason } = req.body;

        if (!reason) {
            return res.status(400).json({ message: 'Motivo da rejeição é obrigatório.' });
        }

        const course = await Course.findByIdAndUpdate(
            req.params.id,
            { 
                status: 'rejected',
                rejectionReason: reason
            },
            { new: true }
        ).populate('instructor', 'name email');

        if (!course) {
            return res.status(404).json({ message: 'Curso não encontrado.' });
        }

        return res.json({
            message: 'Curso rejeitado.',
            course
        });
    } catch (error: any) {
        console.error('💥 ERRO AO REJEITAR CURSO:', error);
        return res.status(500).json({ 
            message: 'Erro no servidor.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Admin publica curso (torna disponível para estudantes)
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
            { 
                status: 'published',
                isPublished: true 
            },
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

// Listar cursos pendentes de aprovação (apenas admin)
export const getPendingCourses = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Usuário não autenticado.' });
        }

        if (req.user.role !== UserRole.ADMIN) {
            return res.status(403).json({ message: 'Acesso negado.' });
        }

        const courses = await Course.find({ status: 'submitted' })
            .populate('instructor', 'name email')
            .sort({ submittedAt: -1 });

        return res.json(courses);
    } catch (error: any) {
        console.error('💥 ERRO AO BUSCAR CURSOS PENDENTES:', error);
        return res.status(500).json({ 
            message: 'Erro no servidor.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};