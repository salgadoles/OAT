import { IsOptional, IsString, IsNumber, IsInt, Min, Max, IsDecimal } from 'class-validator';
import { Type } from 'class-transformer';

export class GetCursosDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  categoria?: string;

  @IsOptional()
  @IsString()
  criador?: string;

  @IsOptional()
  @Type(() => Number)
  @IsDecimal({ decimal_digits: '1,2' })
  @Min(0)
  @Max(5)
  minScore?: number;

  @IsOptional()
  @Type(() => Number)
  @IsDecimal({ decimal_digits: '1,2' })
  @Min(0)
  @Max(5)
  maxScore?: number;

  @IsOptional()
  @IsString()
  skills?: string;
}
