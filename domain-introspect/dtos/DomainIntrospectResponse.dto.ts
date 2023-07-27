import { IsDate, IsNumber, IsString } from "class-validator";

export class DomainIntrospectResponseDto {
  @IsString()
  HostName: string;

  @IsNumber()
  MaliciousScore: number;

  @IsDate()
  AnalysisDate: Date;
}
