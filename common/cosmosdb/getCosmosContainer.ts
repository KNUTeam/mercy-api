import { Database } from "@azure/cosmos";

export interface GetCosmosClientParams {
  database: Database;
  containerName: string;
  partitionKeys: string[];
}

async function getCosmosContainer({
  containerName,
  partitionKeys,
  database,
}: GetCosmosClientParams) {
  return database.containers.createIfNotExists({
    id: containerName,
    partitionKey: {
      paths: partitionKeys,
    },
  });
}

export default getCosmosContainer;
