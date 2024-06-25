import chalk from "chalk";
import { exec, execSync } from "child_process";

export const runCommand = (command: string) => {
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
    console.error(chalk.red(`❌ Error executing command: ${command}`));
    console.error(chalk.red(error.message));
  }
};

export const runCommandSync = (command: string) => {
  try {
    return execSync(command).toString();
  } catch (error) {
    console.error(chalk.red(`❌ Error executing command: ${command}`));
    console.error(chalk.red(error.message));
  }
};
