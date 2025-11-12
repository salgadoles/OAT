import { Response } from 'express';
import { Course } from '../models/Course';
import { AuthRequest } from '../middleware/auth';
import { UserRole } from '../models/User';
import mongoose from 'mongoose';

export const getCourses = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        console.log('🔍 USUÁRIO NA REQUISIÇÃO:', req.user);

        let courses: any[] = [];

        if (!req.user || req.user.role === UserRole.STUDENT) {
            console.log('🎓 Buscando cursos públicos');
            courses = await Course.find({ status: 'published' })
                .populate('instructor', 'name email')
                .select('-requirements -learningObjectives');
        }
        else if (req.user.role === UserRole.PROFESSOR) {
            console.log('👨‍🏫 Buscando cursos do professor:', req.user.id);
            courses = await Course.find({ instructor: req.user.id })
                .populate('instructor', 'name email');
        }
        else if (req.user.role === UserRole.ADMIN) {
            console.log('👑 Admin - todos os cursos');
            courses = await Course.find().populate('instructor', 'name email');
        }

        console.log('📊 Cursos retornados:', courses.length);
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
        console.log('🔍 === GET COURSE BY ID ===');
        console.log('👤 Usuário na requisição:', req.user);
        console.log('🎯 ID do curso solicitado:', req.params.id);

        if (!req.user) {
            console.log('❌ ERRO: Usuário não autenticado');
            return res.status(401).json({ message: 'Usuário não autenticado.' });
        }

        const course = await Course.findById(req.params.id)
            .populate('instructor', 'name email');

        console.log('📚 Curso encontrado:', course ? '✅ Sim' : '❌ Não');

        if (!course) {
            return res.status(404).json({ message: 'Curso não encontrado.' });
        }

        console.log('👨‍🏫 Instructor do curso:', course.instructor?._id);
        console.log('👤 ID do usuário logado:', req.user.id);
        console.log('🔐 Status do curso:', course.status);

        // Controle de acesso baseado no status
        if (req.user.role === UserRole.STUDENT && course.status !== 'published') {
            console.log('❌ Acesso negado: Estudante tentando acessar curso não publicado');
            return res.status(403).json({ message: 'Acesso negado.' });
        }

        // Professores só podem ver seus próprios cursos (exceto se forem publicados)
        if (req.user.role === UserRole.PROFESSOR &&
            course.instructor._id.toString() !== req.user.id &&
            course.status !== 'published') {
            console.log('❌ Acesso negado: Professor tentando acessar curso de outro professor');
            return res.status(403).json({ message: 'Acesso negado.' });
        }

        console.log('✅ Acesso permitido - retornando curso');
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

export const getInstructorCourses = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Usuário não autenticado.' });
        }

        console.log('🟡 Buscando cursos para o professor:', req.user.id);

        // Busca TODOS os cursos do professor, independente do status
        const courses = await Course.find({ instructor: req.user.id })
            .populate('instructor', 'name email')
            .sort({ createdAt: -1 }); // Mais recentes primeiro

        console.log('🟢 Cursos encontrados:', courses.length);

        return res.json(courses);
    } catch (error: any) {
        console.error('💥 ERRO AO BUSCAR CURSOS DO INSTRUTOR:', error);
        return res.status(500).json({
            message: 'Erro ao buscar seus cursos.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const getCourseVideos = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        console.log('🎬 Buscando vídeos do curso:', req.params.id); // Mudei para req.params.id

        const course = await Course.findById(req.params.id); // Mudei para req.params.id

        if (!course) {
            return res.status(404).json({
                message: 'Curso não encontrado'
            });
        }

        // Verificar se o usuário tem acesso
        if (req.user!.role === UserRole.STUDENT && course.status !== 'published') {
            return res.status(403).json({ message: 'Acesso negado.' });
        }

        if (req.user!.role === UserRole.PROFESSOR && course.instructor.toString() !== req.user!.id) {
            return res.status(403).json({ message: 'Acesso negado.' });
        }

        return res.json({
            videos: course.videos || []
        });

    } catch (error: any) {
        console.error('💥 ERRO AO BUSCAR VÍDEOS:', error);
        return res.status(500).json({
            message: 'Erro no servidor.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const addVideoToCourse = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        const { title, url, duration, order, isPreview } = req.body;
        console.log('➕ Adicionando vídeo ao curso:', req.params.id); // Mudei para req.params.id

        const course = await Course.findById(req.params.id); // Mudei para req.params.id

        if (!course) {
            return res.status(404).json({
                message: 'Curso não encontrado'
            });
        }

        // Verificar se o usuário é o instrutor
        if (course.instructor.toString() !== req.user!.id && req.user!.role !== UserRole.ADMIN) {
            return res.status(403).json({ message: 'Acesso negado.' });
        }

        const newVideo = {
            _id: new mongoose.Types.ObjectId(),
            title,
            url,
            duration: parseInt(duration),
            order: parseInt(order),
            isPreview: isPreview || false,
            uploadedAt: new Date()
        };

        // Adicionar ao array de vídeos
        if (!course.videos) {
            course.videos = [];
        }

        course.videos.push(newVideo);
        await course.save();

        return res.status(201).json({
            message: 'Vídeo adicionado com sucesso!',
            video: newVideo
        });

    } catch (error: any) {
        console.error('💥 ERRO AO ADICIONAR VÍDEO:', error);
        return res.status(500).json({
            message: 'Erro no servidor.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
export const updateVideo = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        const { title, url, duration, order, isPreview } = req.body;
        const { id, videoId } = req.params;
        console.log('✏️ Atualizando vídeo:', videoId);

        const course = await Course.findById(id);

        if (!course) {
            return res.status(404).json({
                message: 'Curso não encontrado'
            });
        }

        // Verificar se o usuário é o instrutor
        if (course.instructor.toString() !== req.user!.id && req.user!.role !== UserRole.ADMIN) {
            return res.status(403).json({ message: 'Acesso negado.' });
        }

        // Buscar vídeo pelo ID
        const videoIndex = course.videos.findIndex((video: any) =>
            video._id.toString() === videoId
        );

        if (videoIndex === -1) {
            return res.status(404).json({
                message: 'Vídeo não encontrado'
            });
        }

        // CORREÇÃO: Atualizar vídeo sem usar toObject()
        course.videos[videoIndex] = {
            _id: course.videos[videoIndex]._id,
            title: title || course.videos[videoIndex].title,
            url: url || course.videos[videoIndex].url,
            duration: parseInt(duration) || course.videos[videoIndex].duration,
            order: parseInt(order) || course.videos[videoIndex].order,
            isPreview: isPreview !== undefined ? isPreview : course.videos[videoIndex].isPreview,
            uploadedAt: course.videos[videoIndex].uploadedAt
        };

        await course.save();

        return res.json({
            message: 'Vídeo atualizado com sucesso!',
            video: course.videos[videoIndex]
        });

    } catch (error: any) {
        console.error('💥 ERRO AO ATUALIZAR VÍDEO:', error);
        return res.status(500).json({
            message: 'Erro no servidor.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const deleteVideo = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        const { id, videoId } = req.params; 
        console.log('🗑️ Excluindo vídeo:', videoId);

        const course = await Course.findById(id);

        if (!course) {
            return res.status(404).json({
                message: 'Curso não encontrado'
            });
        }

        // Verificar se o usuário é o instrutor
        if (course.instructor.toString() !== req.user!.id && req.user!.role !== UserRole.ADMIN) {
            return res.status(403).json({ message: 'Acesso negado.' });
        }

        const videoIndex = course.videos.findIndex((video: any) =>
            video._id.toString() === videoId
        );

        if (videoIndex === -1) {
            return res.status(404).json({
                message: 'Vídeo não encontrado'
            });
        }

        course.videos.splice(videoIndex, 1);
        await course.save();

        return res.json({
            message: 'Vídeo excluído com sucesso!'
        });

    } catch (error: any) {
        console.error('💥 ERRO AO EXCLUIR VÍDEO:', error);
        return res.status(500).json({
            message: 'Erro no servidor.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// ==================== CRUD DE ATIVIDADES ====================

export const getCourseActivities = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        const course = await Course.findById(req.params.id); // Mudei para req.params.id

        if (!course) {
            return res.status(404).json({
                message: 'Curso não encontrado'
            });
        }

        // Verificar se o usuário tem acesso
        if (req.user!.role === UserRole.STUDENT && course.status !== 'published') {
            return res.status(403).json({ message: 'Acesso negado.' });
        }

        if (req.user!.role === UserRole.PROFESSOR && course.instructor.toString() !== req.user!.id) {
            return res.status(403).json({ message: 'Acesso negado.' });
        }

        return res.json({
            activities: course.activities || []
        });

    } catch (error: any) {
        console.error('💥 ERRO AO BUSCAR ATIVIDADES:', error);
        return res.status(500).json({
            message: 'Erro no servidor.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const addActivityToCourse = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        const { title, type, instructions, questions, deadline, maxScore, order } = req.body;

        const course = await Course.findById(req.params.id); // Mudei para req.params.id

        if (!course) {
            return res.status(404).json({
                message: 'Curso não encontrado'
            });
        }

        // Verificar se o usuário é o instrutor
        if (course.instructor.toString() !== req.user!.id && req.user!.role !== UserRole.ADMIN) {
            return res.status(403).json({ message: 'Acesso negado.' });
        }

        const newActivity = {
            _id: new mongoose.Types.ObjectId(),
            title,
            type,
            instructions,
            questions: questions || [],
            deadline: deadline ? new Date(deadline) : undefined,
            maxScore: parseInt(maxScore) || 100,
            order: parseInt(order) || (course.activities?.length || 0) + 1,
            createdAt: new Date()
        };

        // Adicionar ao array de atividades
        if (!course.activities) {
            course.activities = [];
        }

        course.activities.push(newActivity);
        await course.save();

        return res.status(201).json({
            message: 'Atividade criada com sucesso!',
            activity: newActivity
        });

    } catch (error: any) {
        console.error('💥 ERRO AO CRIAR ATIVIDADE:', error);
        return res.status(500).json({
            message: 'Erro no servidor.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
export const updateActivity = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        const { title, type, instructions, questions, deadline, maxScore, order } = req.body;
        const { id, activityId } = req.params;

        const course = await Course.findById(id);

        if (!course) {
            return res.status(404).json({
                message: 'Curso não encontrado'
            });
        }

        // Verificar se o usuário é o instrutor
        if (course.instructor.toString() !== req.user!.id && req.user!.role !== UserRole.ADMIN) {
            return res.status(403).json({ message: 'Acesso negado.' });
        }

        const activityIndex = course.activities.findIndex((activity: any) =>
            activity._id.toString() === activityId
        );

        if (activityIndex === -1) {
            return res.status(404).json({
                message: 'Atividade não encontrada'
            });
        }

        // CORREÇÃO: Atualizar atividade sem usar toObject()
        course.activities[activityIndex] = {
            _id: course.activities[activityIndex]._id,
            title: title || course.activities[activityIndex].title,
            type: type || course.activities[activityIndex].type,
            instructions: instructions || course.activities[activityIndex].instructions,
            questions: questions || course.activities[activityIndex].questions || [],
            deadline: deadline ? new Date(deadline) : course.activities[activityIndex].deadline,
            maxScore: parseInt(maxScore) || course.activities[activityIndex].maxScore,
            order: parseInt(order) || course.activities[activityIndex].order,
            createdAt: course.activities[activityIndex].createdAt
        };

        await course.save();

        return res.json({
            message: 'Atividade atualizada com sucesso!',
            activity: course.activities[activityIndex]
        });

    } catch (error: any) {
        console.error('💥 ERRO AO ATUALIZAR ATIVIDADE:', error);
        return res.status(500).json({
            message: 'Erro no servidor.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const deleteActivity = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        const { id, activityId } = req.params; // Mudei para id e activityId

        const course = await Course.findById(id); // Mudei para id

        if (!course) {
            return res.status(404).json({
                message: 'Curso não encontrado'
            });
        }

        // Verificar se o usuário é o instrutor
        if (course.instructor.toString() !== req.user!.id && req.user!.role !== UserRole.ADMIN) {
            return res.status(403).json({ message: 'Acesso negado.' });
        }

        const activityIndex = course.activities.findIndex((activity: any) =>
            activity._id.toString() === activityId
        );

        if (activityIndex === -1) {
            return res.status(404).json({
                message: 'Atividade não encontrada'
            });
        }

        course.activities.splice(activityIndex, 1);
        await course.save();

        return res.json({
            message: 'Atividade excluída com sucesso!'
        });

    } catch (error: any) {
        console.error('💥 ERRO AO EXCLUIR ATIVIDADE:', error);
        return res.status(500).json({
            message: 'Erro no servidor.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// ==================== ALUNOS E ANALYTICS ====================

export const getCourseStudents = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        const course = await Course.findById(req.params.id); // Mudei para req.params.id

        if (!course) {
            return res.status(404).json({
                message: 'Curso não encontrado'
            });
        }

        // Verificar se o usuário é o instrutor
        if (course.instructor.toString() !== req.user!.id && req.user!.role !== UserRole.ADMIN) {
            return res.status(403).json({ message: 'Acesso negado.' });
        }

        // Por enquanto, retornar dados mock
        const students = [
            {
                id: 1,
                name: 'João Silva',
                email: 'joao@email.com',
                progress: 75,
                enrolledAt: '2024-01-15',
                completed: false
            },
            {
                id: 2,
                name: 'Maria Santos',
                email: 'maria@email.com',
                progress: 45,
                enrolledAt: '2024-01-14',
                completed: false
            }
        ];

        return res.json({
            students
        });

    } catch (error: any) {
        console.error('💥 ERRO AO BUSCAR ALUNOS:', error);
        return res.status(500).json({
            message: 'Erro no servidor.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const getCourseAnalytics = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        const course = await Course.findById(req.params.id); // Mudei para req.params.id

        if (!course) {
            return res.status(404).json({
                message: 'Curso não encontrado'
            });
        }

        // Verificar se o usuário é o instrutor
        if (course.instructor.toString() !== req.user!.id && req.user!.role !== UserRole.ADMIN) {
            return res.status(403).json({ message: 'Acesso negado.' });
        }

        // Dados mock para analytics
        const analytics = {
            totalStudents: course.studentsEnrolled || 0,
            completionRate: 25,
            averageProgress: 45,
            totalVideos: course.videos?.length || 0,
            totalActivities: course.activities?.length || 0,
            rating: course.rating || 0,
            revenue: (course.price || 0) * (course.studentsEnrolled || 0)
        };

        return res.json({
            analytics
        });

    } catch (error: any) {
        console.error('💥 ERRO AO BUSCAR ANALYTICS:', error);
        return res.status(500).json({
            message: 'Erro no servidor.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};


// Buscar curso específico do professor
export const getProfessorCourse = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        console.log('👨‍🏫 Buscando curso específico do professor');

        if (!req.user) {
            return res.status(401).json({ message: 'Usuário não autenticado.' });
        }

        const course = await Course.findById(req.params.id)
            .populate('instructor', 'name email');

        if (!course) {
            return res.status(404).json({ message: 'Curso não encontrado.' });
        }

        // Verificar se o professor é o instrutor do curso
        if (req.user.role === UserRole.PROFESSOR && course.instructor._id.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Acesso negado. Este curso não pertence a você.' });
        }

        return res.json(course);
    } catch (error: any) {
        console.error('💥 ERRO AO BUSCAR CURSO DO PROFESSOR:', error);
        return res.status(500).json({
            message: 'Erro no servidor.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};