import { handleConnection } from "~/components/connect";
import { checkProcesses } from "~/components/health-check";
import { DockerInstaller } from "~/installers/docker";
import { ScriptInstaller } from "~/installers/script";
import { logger } from "~/utils/logger";

export const runDevelopment = async (): Promise<void> => {
  const connection = await handleConnection(true);

  await checkProcesses(connection);

  if (DockerInstaller.instance) {
    await DockerInstaller.instance.install("development");
  }

  if (ScriptInstaller.instance) {
    await ScriptInstaller.instance.install("development");
  }

  logger.info("Development environment is ready");
  process.exit(0);
};
