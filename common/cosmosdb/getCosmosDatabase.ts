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
}: GetCosmosClientParams): Promise<Database> {
  const cosmosClient = new CosmosClient({
    endpoint,
    key: primaryKey ? primaryKey : secondaryKey,
  });

  const { database } = await cosmosClient.databases.createIfNotExists({
    id: databaseName,
  });

  return database;
}

export default getCosmosDatabase;
