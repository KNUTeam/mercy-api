import { IsUrl } from "class-validator";

export class DomainInspectionReqDto {
  @IsUrl()
  targetURL: string;
}
