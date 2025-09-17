import { IsEmail, IsOptional, IsPhoneNumber, IsString } from 'class-validator';
import { CreateParentProfileDto } from './create-parent-profile.dto';

export class CreateParentDto {
  @IsEmail()
  email: string;

  @IsPhoneNumber('FR')
  phoneNumber: string;

  @IsString()
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  parentProfile: CreateParentProfileDto;
}
