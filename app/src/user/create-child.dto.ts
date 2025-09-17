import { IsDateString, IsInt, IsString, Min } from 'class-validator';

export class CreateChildDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsDateString()
  dateOfBirth: string;

  @IsInt()
  @Min(1)
  parentId: number;

  @IsInt()
  @Min(1)
  levelId: number;
}
