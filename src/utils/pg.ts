/* eslint-disable import/no-named-as-default-member -- Does not work for some reason. */
import pg from "pg";
import type { Connection } from "~/types/connection";
import { logger } from "./logger";

// Make the connection global
let client: pg.Client | null = null;

export const connect = async (config: Connection): Promise<boolean> => {
  client = new pg.Client({
    database: config.database,
    user: config.username,
    host: config.host,
    port: config.port,
    password: config.password,
  });
  try {
    await client.connect();
    return true;
  } catch (error) {
    logger.error((error as Error).message);
    return false;
  } finally {
    await client.end();
  }
};

export const getClient = (): pg.Client | null => client;
