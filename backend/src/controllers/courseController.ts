// src/controllers/courseController.js - VERSÃO COMPLETA CORRIGIDA
import { Response } from 'express';
import { Course } from '../models/Course';
import { AuthRequest } from '../middleware/auth';
import { UserRole } from '../models/User';
import mongoose from 'mongoose';

// ==================== FUNÇÕES EXISTENTES DO CURSO ====================

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
            .sort({ createdAt: -1 });

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

// ==================== FUNÇÕES PARA VÍDEOS - CORRIGIDAS ====================
export const getCourseVideos = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        console.log('🎬 Buscando vídeos do curso:', req.params.courseId);

        const course = await Course.findById(req.params.courseId);

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
        console.log('➕ Adicionando vídeo ao curso:', req.params.courseId);

        const course = await Course.findById(req.params.courseId);

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
            duration: parseInt(duration) || 0,
            order: parseInt(order) || (course.videos?.length || 0) + 1,
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
        const { courseId, videoId } = req.params;

        console.log('✏️ Atualizando vídeo:', videoId);

        const course = await Course.findById(courseId);

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

        // Atualizar vídeo manualmente
        const currentVideo = course.videos[videoIndex];
        const updatedVideo = {
            _id: currentVideo._id,
            title: title || currentVideo.title,
            url: url || currentVideo.url,
            duration: parseInt(duration) || currentVideo.duration || 0,
            order: parseInt(order) || currentVideo.order || 1,
            isPreview: isPreview !== undefined ? isPreview : (currentVideo.isPreview || false),
            uploadedAt: currentVideo.uploadedAt || new Date()
        };

        course.videos[videoIndex] = updatedVideo;
        await course.save();

        return res.json({
            message: 'Vídeo atualizado com sucesso!',
            video: updatedVideo
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
        const { courseId, videoId } = req.params;

        console.log('🗑️ Excluindo vídeo:', videoId);

        const course = await Course.findById(courseId);

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


// ==================== FUNÇÕES PARA ATIVIDADES - CORRIGIDAS ====================
export const getCourseActivities = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        console.log('📚 Buscando atividades do curso:', req.params.courseId);

        const course = await Course.findById(req.params.courseId);

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

        console.log('✅ Atividades encontradas:', course.activities?.length || 0);

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
    console.log('🎯 === addActivityToCourse - INICIANDO ===');

    try {
        console.log('✅ REQUISIÇÃO CHEGOU NO CONTROLLER!');

        // DEBUG: Parâmetros e Body
        console.log('📋 req.params:', req.params);
        console.log('📦 req.body:', req.body);
        console.log('👤 req.user:', req.user);

        const { courseId } = req.params;
        const { title, type, instructions, deadline, maxScore, order } = req.body;

        // VALIDAÇÃO DO COURSE ID
        console.log('🔍 CourseId recebido:', courseId);

        if (!courseId) {
            console.log('❌ ERRO: courseId está vazio ou undefined');
            return res.status(400).json({ message: 'ID do curso é obrigatório' });
        }

        // VERIFICAR SE É OBJECTID VÁLIDO
        const isValidObjectId = mongoose.Types.ObjectId.isValid(courseId);
        console.log('✅ É ObjectId válido?', isValidObjectId);

        if (!isValidObjectId) {
            console.log('❌ ERRO: courseId não é um ObjectId válido');
            return res.status(400).json({ message: 'ID do curso inválido' });
        }

        // BUSCAR CURSO
        console.log('🔍 Buscando curso no banco com ID:', courseId);
        const course = await Course.findById(courseId);

        console.log('📊 Resultado da busca:');
        console.log('- Curso encontrado:', !!course);

        if (!course) {
            console.log('❌ CURSO NÃO ENCONTRADO NO BANCO');

            // Listar alguns cursos para debug
            const allCourses = await Course.find({}, '_id title instructor').limit(5);
            console.log('📚 Cursos no banco:');
            allCourses.forEach((c, i) => {
                console.log(`   ${i + 1}. ${c._id} - "${c.title}" - Instrutor: ${c.instructor}`);
            });

            return res.status(404).json({ message: 'Curso não encontrado' });
        }

        console.log('✅ CURSO ENCONTRADO:');
        console.log('   - ID:', course._id);
        console.log('   - Título:', course.title);
        console.log('   - Instrutor:', course.instructor);
        console.log('   - Status:', course.status);

        // DEBUG 6: Verificação de permissão
        console.log('🔐 Verificando permissões...');
        console.log('   - Instrutor do curso:', course.instructor.toString());
        console.log('   - ID do usuário logado:', req.user!.id);
        console.log('   - Role do usuário:', req.user!.role);

        const isInstructor = course.instructor.toString() === req.user!.id;
        const isAdmin = req.user!.role === UserRole.ADMIN;

        console.log('   - É instrutor?', isInstructor);
        console.log('   - É admin?', isAdmin);
        console.log('   - Acesso permitido?', isInstructor || isAdmin);

        if (!isInstructor && !isAdmin) {
            console.log('❌ ACESSO NEGADO: Usuário não tem permissão');
            return res.status(403).json({ message: 'Acesso negado.' });
        }

        console.log('✅ PERMISSÃO CONCEDIDA');

        // DEBUG 7: Criação da atividade
        console.log('📝 Criando atividade...');
        const newActivity = {
            _id: new mongoose.Types.ObjectId(),
            title: title || 'Sem título',
            type: type || 'assignment',
            instructions: instructions || 'Sem instruções',
            deadline: deadline ? new Date(deadline) : undefined,
            maxScore: parseInt(maxScore) || 100,
            order: parseInt(order) || (course.activities?.length || 0) + 1,
            createdAt: new Date()
        };

        console.log('📦 Nova atividade criada:', newActivity);

        // Adicionar ao curso
        if (!course.activities) {
            course.activities = [];
        }

        console.log('📊 Atividades antes:', course.activities.length);
        course.activities.push(newActivity);
        console.log('📊 Atividades depois:', course.activities.length);

        // DEBUG 8: Salvamento
        console.log('💾 Salvando curso...');
        await course.save();
        console.log('✅ Curso salvo com sucesso!');

        console.log('🎉 ATIVIDADE CRIADA COM SUCESSO!');

        return res.status(201).json({
            message: 'Atividade criada com sucesso!',
            activity: newActivity
        });

    } catch (error: any) {
        console.error('💥 ERRO CRÍTICO em addActivityToCourse:');
        console.error('💥 Mensagem:', error.message);
        console.error('💥 Stack:', error.stack);

        return res.status(500).json({
            message: 'Erro interno do servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const updateActivity = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        const {
            title,
            type,
            instructions,
            questions,
            deadline,
            maxScore,
            order
        } = req.body;

        const { courseId, activityId } = req.params;

        console.log('✏️ Atualizando atividade:', activityId, 'do curso:', courseId);

        const course = await Course.findById(courseId);

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

        // CORREÇÃO: Atualizar apenas campos que existem no modelo
        const currentActivity = course.activities[activityIndex];

        const updatedActivity = {
            _id: currentActivity._id,
            title: title || currentActivity.title,
            type: type || currentActivity.type,
            instructions: instructions || currentActivity.instructions,
            questions: questions || currentActivity.questions || [],
            deadline: deadline ? new Date(deadline) : currentActivity.deadline,
            maxScore: parseInt(maxScore) || currentActivity.maxScore || 100,
            order: parseInt(order) || currentActivity.order || 1,
            createdAt: currentActivity.createdAt || new Date()
        };

        // Atualizar no array
        course.activities[activityIndex] = updatedActivity;
        await course.save();

        console.log('✅ Atividade atualizada com sucesso:', updatedActivity.title);

        return res.json({
            message: 'Atividade atualizada com sucesso!',
            activity: updatedActivity
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
        const { courseId, activityId } = req.params;

        console.log('🗑️ Excluindo atividade:', activityId, 'do curso:', courseId);

        const course = await Course.findById(courseId);

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

        const deletedActivity = course.activities[activityIndex];
        course.activities.splice(activityIndex, 1);
        await course.save();

        console.log('✅ Atividade excluída com sucesso:', deletedActivity.title);

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

// ==================== FUNÇÕES PARA ALUNOS E ANALYTICS ====================

export const getCourseStudents = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        const course = await Course.findById(req.params.courseId);

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
        const course = await Course.findById(req.params.courseId);

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

// Adicione esta função para debug
export const debugCourse = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        console.log('🔍 DEBUG - Verificando curso:', req.params.courseId);

        const course = await Course.findById(req.params.courseId);

        console.log('📊 Curso encontrado:', course ? 'SIM' : 'NÃO');
        console.log('🎯 ID do curso:', req.params.courseId);
        console.log('👤 Usuário logado:', req.user?.id);
        console.log('🔑 Role do usuário:', req.user?.role);

        if (course) {
            console.log('📝 Detalhes do curso:');
            console.log('- Título:', course.title);
            console.log('- Instrutor:', course.instructor);
            console.log('- Status:', course.status);
            console.log('- Atividades:', course.activities?.length || 0);

            // Verificar se o usuário tem acesso
            const isInstructor = course.instructor.toString() === req.user!.id;
            const isAdmin = req.user!.role === UserRole.ADMIN;
            const hasAccess = isInstructor || isAdmin;

            console.log('🔐 Acesso permitido:', hasAccess);
            console.log('👨‍🏫 É instrutor:', isInstructor);
            console.log('👑 É admin:', isAdmin);
        }

        return res.json({
            courseExists: !!course,
            course: course,
            user: req.user,
            hasAccess: course ? (course.instructor.toString() === req.user!.id || req.user!.role === UserRole.ADMIN) : false
        });

    } catch (error: any) {
        console.error('💥 ERRO NO DEBUG:', error);
        return res.status(500).json({ message: 'Erro no debug' });
    }
};