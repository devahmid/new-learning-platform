import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateChildProfileDto } from './update-child-profile.dto';

export class UpdateChildDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsEnum(['masculin', 'féminin'])
  gender?: 'masculin' | 'féminin';

  @IsOptional()
  levelId?: number;

  @IsOptional()
  level?: { id: number };

  @ValidateNested()
  @Type(() => UpdateChildProfileDto)
  @IsOptional()
  childProfile?: UpdateChildProfileDto;
}
