import { exec, execSync } from "node:child_process";
import { logger } from "./logger";
import { findOS } from "./os";

const parseResponse = (response: string): string => {
  switch (findOS()) {
    case "win32":
      return response.replace(/\r\n/g, "");
    case "darwin":
      return response.replace(/\n/g, "");
    case "linux":
      return response.replace(/\n/g, "");
    default:
      return response;
  }
};

export const runCommand = (command: string): Promise<string> | undefined => {
  try {
    return new Promise<string>((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        }
        if (stderr) {
          reject(new Error(stderr));
        }
        resolve(parseResponse(stdout));
      });
    });
  } catch (error) {
    logger.error(`Error executing command: ${command}`);
    logger.error((error as Error).message);
  }
};

export const runCommandSync = (command: string): string | undefined => {
  try {
    return parseResponse(execSync(command).toString());
  } catch (error) {
    logger.error(`Error executing command: ${command}`);
    logger.error((error as Error).message);
  }
};
