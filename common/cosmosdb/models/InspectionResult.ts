import { Snowflake } from "nodejs-snowflake";
import CosmosModel from "./CosmosModel";

export interface InspectionResultType {
  HostName: string;
  MaliciousScore: number;
  AnalysisDate: Date;
}

export interface CreateInspectionResultParams {
  HostName: string;
  MaliciousScore: number;
  AnalysisDate: Date;
}

class InspectionResultModel extends CosmosModel {
  constructor() {
    super("DomainInspection", "InspectionResult", ["/HostName"]);
  }

  async findByHostName(hostName: string): Promise<InspectionResultType[]> {
    const response = await this.query({
      query: "SELECT * FROM c WHERE c.HostName = @HostNameValue",
      parameters: [
        {
          name: "@HostNameValue",
          value: hostName,
        },
      ],
    });

    return response.resources as InspectionResultType[];
  }

  async createInspectResult({
    HostName,
    MaliciousScore,
    AnalysisDate,
  }: CreateInspectionResultParams) {
    const uid = new Snowflake();
    return this.container.items.create({
      id: String(uid.getUniqueID()),
      HostName,
      MaliciousScore,
      AnalysisDate: AnalysisDate.toISOString(),
    });
  }
}

export default InspectionResultModel;
