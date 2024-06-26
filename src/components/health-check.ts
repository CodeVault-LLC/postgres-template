import ora from "ora";
import type { Connection } from "~/types/connection";
import { checkAddress } from "~/utils/addr";
import { logger } from "~/utils/logger";
import { connect } from "~/utils/pg";

/**
 * This function checks the health of the application
 */
export const checkProcesses = async (
  connection: Connection
): Promise<boolean> => {
  const checkAddr = await checkAddress(connection);
  if (checkAddr) {
    logger.error("Address is already in use");
    return false;
  }

  const spinner = ora("Checking if the database already exists").start();
  const conn = await connect({
    username: connection.username,
    password: connection.password,
    database: connection.database,
    host: connection.host,
    port: connection.port,
  });

  if (conn) {
    spinner.stop();
    logger.error("Database already exists");
    return false;
  }
  spinner.stop();

  return true;
};
