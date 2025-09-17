import { IsNotEmpty, IsOptional, IsInt } from 'class-validator';

export class CreateSubcategoryDto {
  @IsNotEmpty()
  name: string;

  @IsOptional()
  description?: string;

  @IsInt()
  categoryId: number;
}
