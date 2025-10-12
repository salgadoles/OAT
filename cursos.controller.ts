import { Controller, Get, Query, Post, Body, ValidationPipe } from '@nestjs/common';
import { CursosService } from './cursos.service';
import { GetCursosDto } from './dto/get-cursos.dto';
import { Curso } from './curso.entity';

@Controller('api/cursos')
export class CursosController {
  constructor(private readonly cursosService: CursosService) {}

  @Get()
  async findAll(@Query(new ValidationPipe({ transform: true, forbidNonWhitelisted: true })) query: GetCursosDto) {
    const { page, limit, search, categoria, criador, minScore, maxScore, skills } = query;
    return this.cursosService.findAll(page, limit, search, categoria, criador, minScore, maxScore, skills);
  }

  @Post()
  async create(@Body() cursoData: Partial<Curso>) {
    return this.cursosService.create(cursoData);
  }
}

