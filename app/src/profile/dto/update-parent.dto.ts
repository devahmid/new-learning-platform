import { IsEmail, IsOptional, IsPhoneNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateParentProfileDto } from 'src/profile/dto/update-parent-profile.dto';

export class UpdateParentDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsPhoneNumber('FR')
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @ValidateNested()
  @Type(() => UpdateParentProfileDto)
  @IsOptional()
  parentProfile?: UpdateParentProfileDto;
}
