import { IsBoolean, IsDateString, IsIn, IsString } from "class-validator";

export class ChildDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsDateString()
  birthDate: string;

  @IsIn([1, 2, 3, 4, 5])
  arabicLevel: number;

  @IsBoolean()
  hasActivityOnWednesday: boolean;

  @IsBoolean()
  hasActivityOnSaturday: boolean;

  @IsBoolean()
  hasActivityOnSunday: boolean;

  @IsString()
  activityDetails: string;
}
