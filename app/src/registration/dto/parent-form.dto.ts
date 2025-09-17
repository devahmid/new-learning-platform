import { Type } from "class-transformer";
import { IsBoolean, IsEmail, IsPhoneNumber, IsString, ValidateNested } from "class-validator";
import { ChildDto } from "./child.dto";

export class ParentFormDto {
  @IsString()
  fullName: string;

  @IsEmail()
  email: string;

  @IsPhoneNumber('FR')
  phone: string;

  @ValidateNested({ each: true })
  @Type(() => ChildDto)
  children: ChildDto[];
  
  @IsBoolean()
  wasRegisteredLastYear: boolean;
  
  @IsBoolean()
  acceptedConditions: boolean;
}
