import { IsString, IsUrl } from "class-validator";

export class FormInspectionReqDto {
  @IsUrl()
  pageUrl: string;

  @IsString()
  html: string;
}
