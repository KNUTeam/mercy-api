import { IsArray, IsBoolean, IsOptional, IsString } from "class-validator";

export class FormInspectionResDto {
  @IsBoolean()
  IsPrivacyForm: boolean;

  @IsOptional()
  @IsString()
  @IsArray()
  PrivacyFields?: string[];
}
