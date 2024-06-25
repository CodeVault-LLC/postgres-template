import pg from "pg";

// Make the connection global
let client: pg.Client;

export const connect = async (config: {
  user: string;
  password: string;
  database: string;
  host: string;
  port: number;
}): Promise<boolean> => {
  client = new pg.Client(config);
  try {
    if (!client) {
      throw new Error("Failed to create a new client");
    }

    await client.connect();
    return true;
  } catch (error) {
    return false;
  }
};

export const getClient = () => client as pg.Client;
