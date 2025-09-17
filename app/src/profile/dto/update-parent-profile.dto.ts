import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateParentProfileDto {
  @IsOptional()
  @IsString()
  secondaryPhone?: string;

  @IsOptional()
  @IsArray()
  platforms?: string[];

  @IsOptional()
  @IsArray()
  preferredGroups?: string[];

  @IsOptional()
  @IsBoolean()
  emailOnly?: boolean;
}
