import { Connection } from "~/types/connection";
import { runCommand } from "~/utils/cmd";

export const checkAddress = async (
  connection: Connection
): Promise<boolean> => {
  let addr = null;
  try {
    addr = await runCommand(`netstat -na | findstr "${connection.port}"`);
  } catch (error) {}

  return addr ? true : false;
};
