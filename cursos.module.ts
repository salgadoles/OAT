import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Curso } from './curso.entity';
import { Skill } from './skill.entity';
import { CursosService } from './cursos.service';
import { CursosController } from './cursos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Curso, Skill])],
  controllers: [CursosController],
  providers: [CursosService],
  exports: [CursosService] // Exportar o CursosService para que possa ser injetado em outros módulos ou scripts
})
export class CursosModule {}
