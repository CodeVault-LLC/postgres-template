import inquirer from "inquirer";
import { handleConnection } from "~/components/connect";
import { checkProcesses } from "~/components/health-check";
import { DockerInstaller } from "~/installers/docker";
import { ScriptInstaller } from "~/installers/script";
import { logger } from "~/utils/logger";

export const runCustom = async (): Promise<void> => {
  const connection = await handleConnection(true);

  await checkProcesses(connection);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- We trust inquirer
  const { typeDatabase }: { typeDatabase: "docker" | "local" } =
    await inquirer.prompt([
      {
        type: "list",
        name: "typeDatabase",
        message: "Choose the database type",
        choices: [
          { name: "🐳 Docker", value: "docker" },
          { name: "💾 Local", value: "local" },
        ],
      },
    ]);

  if (typeDatabase === "docker") {
    if (DockerInstaller.instance) {
      DockerInstaller.instance.setupData(connection);
    }
  }

  if (ScriptInstaller.instance) {
    await ScriptInstaller.instance.install("custom");
  }

  logger.info("Development environment is ready");
  process.exit(0);
};
