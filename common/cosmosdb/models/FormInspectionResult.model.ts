import CosmosModel from "./CosmosModel";

export interface FormInspectionResultType {
  Domain: string;
  DomainAndPath: string;
  IsPrivacyForm: boolean;
  AnalysisDate: Date;
  PrivacyFields: string[];
}

export interface CreateFormInspectionResultParams {
  Domain: string;
  DomainAndPath: string;
  IsPrivacyForm: boolean;
  AnalysisDate: Date;
  PrivacyFields: string[];
}

class FormInspectionResultModel extends CosmosModel {
  constructor() {
    super("Mercy", "FormInspectionResult", ["/Domain"]);
  }

  async findByDomainAndPath(domainAndPath: string) {
    const response = await this.query({
      query: "SELECT * FROM c WHERE c.DomainAndPath = @DomainAndPathValue",
      parameters: [
        {
          name: "@DomainAndPathValue",
          value: domainAndPath,
        },
      ],
    });

    return response.resources as FormInspectionResultType[];
  }

  async create({
    Domain,
    DomainAndPath,
    IsPrivacyForm,
    AnalysisDate,
    PrivacyFields,
  }: CreateFormInspectionResultParams) {
    return this.container.items.create({
      id: this.generateUID(),
      Domain,
      DomainAndPath,
      IsPrivacyForm,
      AnalysisDate,
      PrivacyFields,
    });
  }
}

export default FormInspectionResultModel;
