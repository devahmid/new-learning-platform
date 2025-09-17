import { IsArray, IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateChildProfileDto {
  @IsOptional()
  @IsBoolean()
  isAvailableWednesdayMorning?: boolean;

  @IsOptional()
  @IsBoolean()
  hasExtracurricularActivity?: boolean;

  @IsOptional()
  @IsString()
  extracurricularDetails?: string;

  @IsOptional()
  @IsArray()
  preferredTimeSlots?: string[];

  @IsOptional()
  @IsString()
  priorArabicExperience?: string;

  @IsOptional()
  @IsEnum(['debutant', 'lecture', 'fluide', 'ecriture'])
  arabicLevel?: 'debutant' | 'lecture' | 'fluide' | 'ecriture';

  @IsOptional()
  @IsBoolean()
  hasLearningDisability?: boolean;

  @IsOptional()
  @IsArray()
  disabilities?: string[];

  @IsOptional()
  @IsString()
  supportDetails?: string;
}
