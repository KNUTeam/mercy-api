import {
  ContainerResponse,
  DatabaseResponse,
  FeedOptions,
  SqlQuerySpec,
} from "@azure/cosmos";
import getCosmosContainer from "../getCosmosContainer";
import getCosmosDatabase from "../getCosmosDatabase";

abstract class CosmosModel {
  protected databaseResponse?: DatabaseResponse;
  protected containerResponse?: ContainerResponse;

  constructor(
    private readonly DATABASE_NAME: string,
    private readonly CONTAINER_NAME: string,
    private readonly PARTITION_KEYS: string[]
  ) {}

  public async init() {
    this.databaseResponse = await getCosmosDatabase({
      databaseName: this.DATABASE_NAME,
      primaryKey: process.env.AZURE_COSMOS_DB_PKEY,
      secondaryKey: process.env.AZURE_COSMOS_DB_SKEY,
      endpoint: process.env.AZURE_COSMOS_DB_URL,
    });

    const { database } = this.databaseResponse;

    this.containerResponse = await getCosmosContainer({
      database,
      containerName: this.CONTAINER_NAME,
      partitionKeys: this.PARTITION_KEYS,
    });
  }

  public async query(query: string | SqlQuerySpec, options?: FeedOptions) {
    return this.container.items.query(query, options).fetchAll();
  }

  get database() {
    return this.databaseResponse?.database;
  }

  get container() {
    return this.containerResponse?.container;
  }
}

export default CosmosModel;
