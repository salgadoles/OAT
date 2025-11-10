import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { Curso } from './curso.entity';
import { Skill } from './skill.entity';

@Injectable()
export class CursosService {
  constructor(
    @InjectRepository(Curso) private cursosRepository: Repository<Curso>,
    @InjectRepository(Skill) private skillsRepository: Repository<Skill>,
  ) {}

  async findAll(
    page = 1,
    limit = 10,
    search?: string,
    categoria?: string,
    criador?: string,
    minScore?: number,
    maxScore?: number,
    skills?: string,
  ): Promise<{ data: Curso[]; meta: any }> {
    const skip = (page - 1) * limit;
    const queryBuilder = this.cursosRepository.createQueryBuilder('curso');

    queryBuilder.leftJoinAndSelect('curso.skills', 'skill');

    if (search) {
      queryBuilder.andWhere(
        '(curso.titulo LIKE :search OR curso.descricao LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (categoria) {
      queryBuilder.andWhere('curso.categoria = :categoria', { categoria });
    }

    if (criador) {
      queryBuilder.andWhere('curso.criador LIKE :criador', { criador: `%${criador}%` });
    }

    if (minScore) {
      queryBuilder.andWhere('curso.score >= :minScore', { minScore });
    }

    if (maxScore) {
      queryBuilder.andWhere('curso.score <= :maxScore', { maxScore });
    }

    if (skills) {
      const skillNames = skills.split(',').map((s) => s.trim());
      queryBuilder
        .andWhere('skill.nome IN (:...skillNames)', { skillNames })
        .groupBy('curso.id')
        .having('COUNT(DISTINCT skill.id) = :skillCount', { skillCount: skillNames.length });
    }

    const [data, totalItems] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const itemCount = data.length;
    const totalPages = Math.ceil(totalItems / limit);
    const currentPage = page;

    return {
      data,
      meta: {
        totalItems,
        itemCount,
        itemsPerPage: limit,
        totalPages,
        currentPage,
      },
    };
  }

  async create(cursoData: Partial<Curso>): Promise<Curso> {
    const newCurso = this.cursosRepository.create(cursoData);
    return this.cursosRepository.save(newCurso);
  }

  async createSkill(skillData: Partial<Skill>): Promise<Skill> {
    const newSkill = this.skillsRepository.create(skillData);
    return this.skillsRepository.save(newSkill);
  }

  async findSkillByName(name: string): Promise<Skill | undefined> {
    return this.skillsRepository.findOne({ where: { nome: name } });
  }

  async addSkillsToCurso(cursoId: number, skillNames: string[]): Promise<Curso> {
    const curso = await this.cursosRepository.findOne({ where: { id: cursoId }, relations: ['skills'] });
    if (!curso) {
      throw new Error('Curso não encontrado');
    }

    const skillsToAdd: Skill[] = [];
    for (const skillName of skillNames) {
      let skill = await this.findSkillByName(skillName);
      if (!skill) {
        skill = await this.createSkill({ nome: skillName });
      }
      skillsToAdd.push(skill);
    }

    curso.skills = [...curso.skills, ...skillsToAdd];
    return this.cursosRepository.save(curso);
  }
}

