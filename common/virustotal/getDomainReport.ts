import axios from "axios";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import VirusTotalErrorException from "../exceptions/VirusTotalError.exception";
import { GetDomainReportDto } from "./dtos/GetDomainReport.dto";

async function getDomainReport(
  domainName: string
): Promise<GetDomainReportDto[]> {
  const options = {
    method: "GET",
    url: `https://www.virustotal.com/api/v3/domains/${domainName}`,
    headers: {
      accept: "application/json",
      "x-apikey": process.env.VIRUSTOTAL_API_KEY,
    },
  };

  const response = await axios.request(options);
  const raw = response?.data?.data?.attributes?.last_analysis_results as any;
  if (!raw || response.status !== 200) {
    throw new VirusTotalErrorException();
  }

  const resultDtos: GetDomainReportDto[] = [];
  for (const companyName of Object.keys(raw)) {
    const dto = plainToInstance(GetDomainReportDto, {
      companyName,
      category: raw[companyName].category,
      result: raw[companyName].result,
      method: raw[companyName].method,
      engineName: raw[companyName].engine_name,
    });

    const errors = await validate(dto);
    if (errors.length === 0) {
      resultDtos.push(dto);
    }
  }

  return resultDtos;
}

export default getDomainReport;
