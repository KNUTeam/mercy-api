import { Transform } from "class-transformer";
import { IsString, IsUrl } from "class-validator";

export class DomainIntrospectRequestDto {
  @IsUrl()
  targetURL: string;
}
