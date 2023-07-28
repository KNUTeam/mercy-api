import { HttpRequest } from "@azure/functions";
import { plainToInstance } from "class-transformer";
import { validateOrReject } from "class-validator";
import DomainInspectionResultModel from "../common/cosmosdb/models/DomainInspectionResult.model";
import { differenceInDays } from "date-fns";
import getDomainReport from "../common/virustotal/getDomainReport";
import { EDomainReportResult } from "../common/enums/VirusTotal.enum";
import { DomainInspectionReqDto } from "./dtos/DomainInspectionReq.dto";
import { DomainInspectionResDto } from "./dtos/DomainInspectionRes.dto";
import ehr from "../common/utils/ehr";

async function domainIntrospectService(
  dto: DomainInspectionReqDto
): Promise<DomainInspectionResDto> {
  // 필요한 모델 초기화
  const InspectionResult = new DomainInspectionResultModel();
  await Promise.all([InspectionResult.init()]);

  const url = new URL(dto.targetURL);

  // 디비에 캐싱된 데이터가 있는지 확인
  const items = await InspectionResult.findByDomain(url.hostname);
  if (items.length > 0) {
    items.sort(
      (a, b) =>
        new Date(b.AnalysisDate).getTime() - new Date(a.AnalysisDate).getTime()
    );

    const lastAnalysisDate = new Date(items[0].AnalysisDate);
    if (differenceInDays(new Date(), lastAnalysisDate) < 90) {
      // 마지막 분석 후 90일이 지나지 않았을 때만 캐싱된 데이터 이용
      return plainToInstance(DomainInspectionResDto, {
        Domain: items[0].Domain,
        MaliciousScore: items[0].MaliciousScore,
        AnalysisDate: items[0].AnalysisDate,
      });
    }
  }

  let maliciousScore = 0;
  const now = new Date();
  const domainReportDtos = await getDomainReport(url.hostname);
  for (const { result } of domainReportDtos) {
    switch (result) {
      case EDomainReportResult.PHISHING:
        maliciousScore += 10;
        break;
      case EDomainReportResult.MALICIOUS:
        maliciousScore += 1;
        break;
      case EDomainReportResult.UNRATED:
        maliciousScore += 0.1;
        break;
    }
  }

  // 디비에 캐싱
  await InspectionResult.create({
    Domain: url.hostname,
    MaliciousScore: maliciousScore,
    AnalysisDate: now,
  });

  return plainToInstance(DomainInspectionResDto, {
    Domain: url.hostname,
    MaliciousScore: maliciousScore,
    AnalysisDate: now,
  });
}

async function domainIntrospectDtoGen(
  req: HttpRequest
): Promise<DomainInspectionReqDto> {
  // 입력 초기화
  const dto = plainToInstance(DomainInspectionReqDto, req.body);
  await validateOrReject(dto);

  return dto;
}

export default ehr<DomainInspectionReqDto, DomainInspectionResDto>(
  domainIntrospectService,
  domainIntrospectDtoGen
);
