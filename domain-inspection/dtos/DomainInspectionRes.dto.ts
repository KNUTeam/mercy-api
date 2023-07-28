import { IsDate, IsNumber, IsString } from "class-validator";

export class DomainInspectionResDto {
  @IsString()
  HostName: string;

  @IsNumber()
  MaliciousScore: number;

  @IsDate()
  AnalysisDate: Date;
}
