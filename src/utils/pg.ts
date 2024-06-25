/* eslint-disable import/no-named-as-default-member -- Does not work for some reason. */
import pg from "pg";

// Make the connection global
let client: pg.Client | null = null;

export const connect = async (config: {
  user: string;
  password: string;
  database: string;
  host: string;
  port: number;
}): Promise<boolean> => {
  client = new pg.Client(config);
  try {
    await client.connect();
    return true;
  } catch (error) {
    return false;
  }
};

export const getClient = (): pg.Client | null => client;
