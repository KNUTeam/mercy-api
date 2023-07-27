import { IsEnum, IsString } from "class-validator";
import {
  EDomainReportCategory,
  EDomainReportResult,
} from "../../enums/VirusTotal.enum";

export class GetDomainReportDto {
  @IsString()
  companyName: string;

  @IsEnum(EDomainReportCategory)
  category: EDomainReportCategory;

  @IsEnum(EDomainReportResult)
  result: EDomainReportResult;

  @IsString()
  method: string;

  @IsString()
  engineName: string;
}
