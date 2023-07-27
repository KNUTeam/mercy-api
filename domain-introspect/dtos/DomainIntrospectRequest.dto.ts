import { IsUrl } from "class-validator";

export class DomainIntrospectRequestDto {
  @IsUrl()
  targetURL: string;
}
