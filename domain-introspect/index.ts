import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { plainToInstance } from "class-transformer";
import { validateOrReject } from "class-validator";
import InspectionResultModel from "../common/cosmosdb/models/InspectionResult";
import getDomainReport from "../common/virustotal/getDomainReport";
import { DomainIntrospectRequestDto } from "./dtos/DomainIntrospectRequest.dto";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  // 필요한 모델 초기화
  const InspectionResult = new InspectionResultModel();
  await Promise.all([InspectionResult.init()]);

  // 입력 초기화
  const domainIntrospectDto = plainToInstance(
    DomainIntrospectRequestDto,
    req.body
  );
  await validateOrReject(domainIntrospectDto);

  // DB 에서 이 URL 에 대해 검증된 캐시가 있는지 확인
  const { targetURL } = domainIntrospectDto;
  const url = new URL(targetURL);
  const item = await InspectionResult.findByHostName(url.hostname);

  if (item.length > 0) {
    context.res = {
      status: 200,
      body: item[0],
    };
  }

  context.res = {
    status: 200,
    body: "virustotal 요청 보내서 디비 넣는 작업 예정",
  };
};

export default httpTrigger;
