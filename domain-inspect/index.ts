import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import getCosmosDatabase from "../common/cosmosdb/getCosmosDatabase";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const db = await getCosmosDatabase({
    databaseName: "DomainIntrospect",
    primaryKey: process.env.AZURE_COSMOS_DB_PKEY,
    secondaryKey: process.env.AZURE_COSMOS_DB_SKEY,
    endpoint: process.env.AZURE_COSMOS_DB_URL,
  });

  context.res = {
    // status: 200, /* Defaults to 200 */
    body: "cosmos 디비 연결 됨",
  };
};

export default httpTrigger;
