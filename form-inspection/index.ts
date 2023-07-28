import { HttpRequest } from "@azure/functions";
import { plainToInstance } from "class-transformer";
import { validateOrReject } from "class-validator";
import { differenceInDays } from "date-fns";
import FormInspectionResultModel from "../common/cosmosdb/models/FormInspectionResult.model";
import ehr from "../common/utils/ehr";
import { FormInspectionReqDto } from "./dtos/FormInspectionReq.dto";
import { FormInspectionResDto } from "./dtos/FormInspectionRes.dto";

async function formInspectionService({
  pageUrl,
  html,
}: FormInspectionReqDto): Promise<FormInspectionResDto> {
  // 필요한 모델 초기화
  const IntrospectResult = new FormInspectionResultModel();
  await Promise.all([IntrospectResult.init()]);

  // 디비에 캐싱된 데이터가 있는지 확인
  const url = new URL(pageUrl);
  const domainAndPath = `${url.hostname}${url.pathname}`;
  const items = await IntrospectResult.findByDomainAndPath(domainAndPath);

  if (items.length > 0) {
    const item = items[0];
    if (differenceInDays(new Date(), new Date(item.AnalysisDate)) < 7) {
      return plainToInstance(FormInspectionResDto, {
        IsPrivacyForm: item.IsPrivacyForm,
        PrivacyFields: item.PrivacyFields,
      });
    }
  }

  // TODO ChatGPT 를 이용해서 해당 폼에 개인정보 입력 창이 있는지 물업보기
  // TODO create() 써서 데이터 저장
  return plainToInstance(FormInspectionResDto, {
    IsPrivacyForm: false,
    PrivacyFields: ["ChatGPT", "가 대답한", "값 줘야함"],
  });
}

async function formInspectionDtoGen(
  req: HttpRequest
): Promise<FormInspectionReqDto> {
  const dto = plainToInstance(FormInspectionReqDto, req.body);
  await validateOrReject(dto);

  return dto;
}

export default ehr<FormInspectionReqDto, FormInspectionResDto>(
  formInspectionService,
  formInspectionDtoGen
);
