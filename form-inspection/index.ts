import { HttpRequest } from "@azure/functions";
import { plainToInstance } from "class-transformer";
import { validateOrReject } from "class-validator";
import { differenceInDays } from "date-fns";
import validatePrivacyForm, {
  ValidatePrivacyFormResult,
} from "../common/chatgpt/validatePrivacyForm";
import FormInspectionResultModel from "../common/cosmosdb/models/FormInspectionResult.model";
import ehr from "../common/utils/ehr";
import { FormInspectionReqDto } from "./dtos/FormInspectionReq.dto";
import { FormInspectionResDto } from "./dtos/FormInspectionRes.dto";

async function formInspectionService({
  pageUrl,
  html,
}: FormInspectionReqDto): Promise<FormInspectionResDto> {
  // 필요한 모델 초기화
  const FormInspectionResult = new FormInspectionResultModel();
  await Promise.all([FormInspectionResult.init()]);

  // 디비에 캐싱된 데이터가 있는지 확인
  const url = new URL(pageUrl);
  const domainAndPath = `${url.hostname}${url.pathname}`;
  const items = await FormInspectionResult.findByDomainAndPath(domainAndPath);

  if (items.length > 0) {
    const item = items[0];
    if (differenceInDays(new Date(), new Date(item.AnalysisDate)) < 7) {
      return plainToInstance(FormInspectionResDto, {
        IsPrivacyForm: item.IsPrivacyForm,
        PrivacyFields: item.PrivacyFields,
      });
    }
  }

  const { isPrivacyForm, privacyFields } = await validatePrivacyForm(html);
  await FormInspectionResult.upsert({
    id: items[0] ? items[0].id : FormInspectionResult.generateUID(),
    Domain: url.hostname,
    DomainAndPath: domainAndPath,
    IsPrivacyForm: isPrivacyForm,
    AnalysisDate: new Date(),
    PrivacyFields: privacyFields,
  });

  return plainToInstance(FormInspectionResDto, {
    IsPrivacyForm: isPrivacyForm,
    PrivacyFields: privacyFields,
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
