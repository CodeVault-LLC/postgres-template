import { exec, execSync } from "node:child_process";
import { logger } from "./logger";

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
        resolve(stdout);
      });
    });
  } catch (error) {
    logger.error(`Error executing command: ${command}`);
    logger.error((error as Error).message);
  }
};

export const runCommandSync = (command: string): string | undefined => {
  try {
    return execSync(command).toString();
  } catch (error) {
    logger.error(`Error executing command: ${command}`);
    logger.error((error as Error).message);
  }
};
