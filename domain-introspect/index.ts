import { HttpRequest } from "@azure/functions";
import { plainToInstance } from "class-transformer";
import { validateOrReject } from "class-validator";
import InspectionResultModel from "../common/cosmosdb/models/InspectionResult";
import { DomainIntrospectRequestDto } from "./dtos/DomainIntrospectRequest.dto";
import { DomainIntrospectResponseDto } from "./dtos/DomainIntrospectResponse.dto";
import ehr from "../common/utils/ehr";
import { differenceInDays } from "date-fns";
import getDomainReport from "../common/virustotal/getDomainReport";
import { EDomainReportResult } from "../common/enums/VirusTotal.enum";

async function domainIntrospectService(
  dto: DomainIntrospectRequestDto
): Promise<DomainIntrospectResponseDto> {
  // 필요한 모델 초기화
  const InspectionResult = new InspectionResultModel();
  await Promise.all([InspectionResult.init()]);

  const url = new URL(dto.targetURL);

  // 디비에 캐싱된 데이터가 있는지 확인
  const items = await InspectionResult.findByHostName(url.hostname);
  if (items.length > 0) {
    items.sort(
      (a, b) =>
        new Date(b.AnalysisDate).getTime() - new Date(a.AnalysisDate).getTime()
    );

    const lastAnalysisDate = new Date(items[0].AnalysisDate);
    if (differenceInDays(new Date(), lastAnalysisDate) < 90) {
      // 마지막 분석 후 90일이 지나지 않았을 때만 캐싱된 데이터 이용
      return plainToInstance(DomainIntrospectResponseDto, {
        HostName: items[0].HostName,
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
  await InspectionResult.createInspectResult({
    HostName: url.hostname,
    MaliciousScore: maliciousScore,
    AnalysisDate: now,
  });

  return plainToInstance(DomainIntrospectResponseDto, {
    HostName: url.hostname,
    MaliciousScore: maliciousScore,
    AnalysisDate: now,
  });
}

async function domainIntrospectDtoGen(
  req: HttpRequest
): Promise<DomainIntrospectRequestDto> {
  // 입력 초기화
  const dto = plainToInstance(DomainIntrospectRequestDto, req.body);
  await validateOrReject(dto);

  return dto;
}

export default ehr<DomainIntrospectRequestDto, DomainIntrospectResponseDto>(
  domainIntrospectService,
  domainIntrospectDtoGen
);
