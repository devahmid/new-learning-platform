import {
  IsDateString,
  IsEmail,
  IsOptional,
  IsString,
  IsEnum,
  Matches,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+33[1-9]\d{8}$/, {
    message:
      'Le numéro de téléphone doit être au format international (ex: +33612345678)',
  })
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsEnum(['parent', 'child'])
  type?: 'parent' | 'child';

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  level?: { id: number };

  @IsOptional()
  classe?: { id: number };

  @IsOptional()
  @IsString()
  resetToken?: string;

  @IsOptional()
  @IsDateString()
  resetTokenExpiration?: string;
}
