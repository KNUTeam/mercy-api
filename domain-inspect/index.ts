import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import getCosmosDatabase from "../common/cosmosdb/getCosmosDatabase";
import getCosmosContainer from "../common/cosmosdb/getCosmosContainer";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const { database } = await getCosmosDatabase({
    databaseName: "DomainInspection",
    primaryKey: process.env.AZURE_COSMOS_DB_PKEY,
    secondaryKey: process.env.AZURE_COSMOS_DB_SKEY,
    endpoint: process.env.AZURE_COSMOS_DB_URL,
  });

  const { container } = await getCosmosContainer({
    database,
    containerName: "InspectionResult",
    partitionKeys: ["/HostName"],
  });

  const { resources: introspectResultItem } = await container.items
    .query({
      query: "SELECT * FROM c WHERE c.HostName = @HostNameValue",
      parameters: [
        {
          name: "@HostNameValue",
          value: "www.naverportal.com",
        },
      ],
    })
    .fetchAll();

  context.res = {
    // status: 200, /* Defaults to 200 */
    body: introspectResultItem,
  };
};

export default httpTrigger;
