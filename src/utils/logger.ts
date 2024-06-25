/* eslint-disable no-console -- Using this to log information */
import chalk from "chalk";

export const logger = {
  error(...args: unknown[]) {
    console.log(chalk.red("❌", ...args));
  },
  warn(...args: unknown[]) {
    console.log(chalk.yellow("⚠️", ...args));
  },
  info(...args: unknown[]) {
    console.log(`${chalk.blue("🧹")} ${chalk.gray(...args)}`);
  },
  debug(...args: unknown[]) {
    if (process.env.NODE_ENV === "production") return;
    console.log(
      chalk.black("[") + chalk.bold("DEBUG") + chalk.black("]"),
      chalk.gray(...args)
    );
  },
  success(...args: unknown[]) {
    console.log(chalk.green("✅", ...args));
  },
};
