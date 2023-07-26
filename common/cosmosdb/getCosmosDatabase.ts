import { CosmosClient, Database } from "@azure/cosmos";

export interface GetCosmosClientParams {
  endpoint: string;
  primaryKey?: string;
  secondaryKey?: string;
  databaseName: string;
}

async function getCosmosDatabase({
  endpoint,
  primaryKey,
  secondaryKey,
  databaseName,
}: GetCosmosClientParams) {
  const cosmosClient = new CosmosClient({
    endpoint,
    key: primaryKey ? primaryKey : secondaryKey,
  });

  return cosmosClient.databases.createIfNotExists({
    id: databaseName,
  });
}

export default getCosmosDatabase;
