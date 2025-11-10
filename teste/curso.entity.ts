import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { Skill } from './skill.entity';

@Entity('cursos')
export class Curso {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  titulo: string;

  @Column('text')
  descricao: string;

  @Column({ length: 255 })
  criador: string;

  @Column({ length: 100 })
  categoria: string;

  @Column('decimal', { precision: 2, scale: 1 })
  score: number;

  @Column('decimal', { precision: 10, scale: 2 })
  preco: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  promocao: number;

  @Column({ nullable: true })
  percentual_desconto: number;

  @Column({ length: 255 })
  imagem_url: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  data_criacao: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  data_atualizacao: Date;

  @ManyToMany(() => Skill)
  @JoinTable({
    name: 'curso_skills',
    joinColumn: { name: 'curso_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'skill_id', referencedColumnName: 'id' },
  })
  skills: Skill[];
}
