import { IsDate, IsNumber, IsString } from "class-validator";

export class DomainInspectionResDto {
  @IsString()
  Domain: string;

  @IsNumber()
  MaliciousScore: number;

  @IsDate()
  AnalysisDate: Date;
}
