// services/CourseService.ts
import { Course, ICourse } from '../models/Course';
import { Types } from 'mongoose';

export class CourseService {
  
  // Professor cria curso (rascunho)
  async createCourse(courseData: Partial<ICourse>): Promise<ICourse> {
    const course = new Course({
      ...courseData,
      status: 'draft',
      studentsEnrolled: 0,
      rating: 0,
      videos: [],
      activities: []
    });
    
    return await course.save();
  }

  // Professor adiciona vídeo
  async addVideo(courseId: string, videoData: any): Promise<ICourse> {
    const course = await Course.findById(courseId);
    if (!course) throw new Error('Curso não encontrado');

    const video = {
      _id: new Types.ObjectId(),
      ...videoData,
      order: course.videos.length + 1,
      uploadedAt: new Date()
    };

    course.videos.push(video);
    
    // Atualiza duração total do curso
    course.duration = course.videos.reduce((total, vid) => total + (vid.duration || 0), 0) / 60;
    
    return await course.save();
  }

  // Professor adiciona atividade
  async addActivity(courseId: string, activityData: any): Promise<ICourse> {
    const course = await Course.findById(courseId);
    if (!course) throw new Error('Curso não encontrado');

    const activity = {
      _id: new Types.ObjectId(),
      ...activityData,
      order: course.activities.length + 1,
      createdAt: new Date()
    };

    course.activities.push(activity);
    return await course.save();
  }

  // Professor submete para aprovação
  async submitForApproval(courseId: string): Promise<ICourse> {
    const course = await Course.findById(courseId);
    if (!course) throw new Error('Curso não encontrado');

    // Validações antes de submeter
    if (course.videos.length === 0) {
      throw new Error('Adicione pelo menos um vídeo antes de enviar para aprovação');
    }

    course.status = 'submitted';
    course.submittedAt = new Date();
    
    return await course.save();
  }

  // Admin aprova curso
  async approveCourse(courseId: string, adminId: string): Promise<ICourse> {
    const course = await Course.findById(courseId);
    if (!course) throw new Error('Curso não encontrado');

    course.status = 'approved';
    course.approvedAt = new Date();
    course.approvedBy = new Types.ObjectId(adminId);
    
    return await course.save();
  }

  // Admin rejeita curso
  async rejectCourse(courseId: string, adminId: string, reason: string): Promise<ICourse> {
    const course = await Course.findById(courseId);
    if (!course) throw new Error('Curso não encontrado');

    course.status = 'rejected';
    course.rejectionReason = reason;
    
    return await course.save();
  }

  // Admin publica curso (torna disponível)
  async publishCourse(courseId: string): Promise<ICourse> {
    const course = await Course.findById(courseId);
    if (!course) throw new Error('Curso não encontrado');

    course.status = 'published';
    course.isPublished = true;
    
    return await course.save();
  }

  // Buscar cursos pendentes (para admin)
  async getPendingCourses(): Promise<ICourse[]> {
    return await Course.find({ status: 'submitted' })
      .populate('instructor', 'name email')
      .sort({ submittedAt: -1 });
  }

  // Buscar cursos do professor
  async getTeacherCourses(teacherId: string): Promise<ICourse[]> {
    return await Course.find({ instructor: teacherId })
      .sort({ updatedAt: -1 });
  }

  // Migração: atualizar cursos existentes
  async migrateExistingCourses(): Promise<void> {
    const courses = await Course.find({ 
      $or: [
        { status: { $exists: false } },
        { videos: { $exists: false } }
      ]
    });

    for (const course of courses) {
      if (!course.status) {
        course.status = course.isPublished ? 'published' : 'draft';
        course.videos = course.videos || [];
        course.activities = course.activities || [];
        await course.save();
      }
    }
  }
}