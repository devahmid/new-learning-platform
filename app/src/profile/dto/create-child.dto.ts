import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CreateChildProfileDto } from './create-child-profile.dto';

export class CreateChildDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsDateString()
  dateOfBirth: string;

  @IsEnum(['masculin', 'féminin'])
  gender: 'masculin' | 'féminin';

  @IsNotEmpty()
  parentId: number;

  @IsNotEmpty()
  levelId: number;

  @IsOptional()
  childProfile?: CreateChildProfileDto;
}
