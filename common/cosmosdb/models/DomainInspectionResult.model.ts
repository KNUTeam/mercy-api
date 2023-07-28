import { Snowflake } from "nodejs-snowflake";
import CosmosModel from "./CosmosModel";

export interface DomainInspectionResultType {
  Domain: string;
  MaliciousScore: number;
  AnalysisDate: Date;
}

export interface CreateDomainInspectionResultParams {
  Domain: string;
  MaliciousScore: number;
  AnalysisDate: Date;
}

class DomainInspectionResultModel extends CosmosModel {
  constructor() {
    super("Mercy", "DomainInspectionResult", ["/Domain"]);
  }

  async findByDomain(domain: string): Promise<DomainInspectionResultType[]> {
    const response = await this.query({
      query: "SELECT * FROM c WHERE c.Domain = @DomainValue",
      parameters: [
        {
          name: "@DomainValue",
          value: domain,
        },
      ],
    });

    return response.resources as DomainInspectionResultType[];
  }

  async create({
    Domain,
    MaliciousScore,
    AnalysisDate,
  }: CreateDomainInspectionResultParams) {
    return this.container.items.create({
      id: this.generateUID(),
      Domain,
      MaliciousScore,
      AnalysisDate: AnalysisDate.toISOString(),
    });
  }
}

export default DomainInspectionResultModel;
