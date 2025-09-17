import { IsArray, IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateChildProfileDto {
  @IsBoolean()
  @IsOptional()
  isAvailableWednesdayMorning?: boolean;

  @IsBoolean()
  @IsOptional()
  hasExtracurricularActivity?: boolean;

  @IsString()
  @IsOptional()
  extracurricularDetails?: string;

  @IsArray()
  @IsOptional()
  preferredTimeSlots?: string[]; // ex: ['mercredi_aprem', 'dimanche_matin']

  @IsString()
  @IsOptional()
  priorArabicExperience?: string;

  @IsEnum(['debutant', 'lecture', 'fluide', 'ecriture'])
  @IsOptional()
  arabicLevel?: 'debutant' | 'lecture' | 'fluide' | 'ecriture';

  @IsBoolean()
  @IsOptional()
  hasLearningDisability?: boolean;

  @IsArray()
  @IsOptional()
  disabilities?: string[]; // ['dyslexie', 'tdah']

  @IsString()
  @IsOptional()
  supportDetails?: string;
}
