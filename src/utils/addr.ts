import type { Connection } from "~/types/connection";
import { runCommand } from "~/utils/cmd";

export const checkAddress = async (
  connection: Connection
): Promise<boolean> => {
  let addr: string | null | undefined;
  try {
    addr = await runCommand(
      `netstat -na | findstr "${connection.port.toString()}"`
    );
  } catch (error) {
    addr = null;
  }

  return !addr;
};
