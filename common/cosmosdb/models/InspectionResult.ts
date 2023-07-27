import CosmosModel from "./CosmosModel";

export interface InspectionResultType {
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
}

export default InspectionResultModel;
