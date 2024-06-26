import inquirer from "inquirer";
import { logger } from "./utils/logger.js";
import { DockerInstaller } from "./installers/docker.js";
import { ScriptInstaller } from "./installers/script.js";
import { runDevelopment } from "./mode/development.js";
import { runCustom } from "./mode/custom.js";

const main = async (): Promise<void> => {
  // eslint-disable-next-line no-new -- We need to instantiate these classes
  new DockerInstaller();
  // eslint-disable-next-line no-new -- We need to instantiate these classes
  new ScriptInstaller();

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- We trust inquirer
  const mode: {
    mode: "development" | "production" | "custom";
  } = await inquirer.prompt([
    {
      type: "list",
      name: "mode",
      message: "Select the enviroment mode",
      choices: [
        { name: "💻 Development", value: "development" },
        { name: "🚀 Production", value: "production" },
        { name: "🔧 Custom", value: "custom" },
      ],
    },
  ]);

  switch (mode.mode) {
    case "development":
      await runDevelopment();
      break;
    case "production":
      logger.warn("Production mode not implemented yet");
      process.exit(0);
      break;
    case "custom":
      await runCustom();
      break;
    default:
      throw new Error("Invalid mode");
  }
};

main().catch((err: unknown) => {
  logger.error("Aborting installation...");
  if (err instanceof Error) {
    logger.error(err);
  } else {
    logger.error(
      "An unknown error has occurred. Please open an issue on github with the below:"
    );
    logger.error(err);
  }
  process.exit(1);
});
