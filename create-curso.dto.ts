import { IsString, IsNotEmpty, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SkillDto {
  @IsString()
  @IsNotEmpty()
  nome: string;
}

export class CreateCursoDto {
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @IsString()
  @IsNotEmpty()
  descricao: string;

  @IsString()
  @IsNotEmpty()
  instituicao: string;

  @IsString()
  @IsNotEmpty()
  duracao: string;

  @IsString()
  @IsNotEmpty()
  nivel: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SkillDto)
  skills?: SkillDto[];
}
