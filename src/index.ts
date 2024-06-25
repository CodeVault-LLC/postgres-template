import ora from "ora";
import inquirer from "inquirer";
import { logger } from "./utils/logger.js";
import { connect } from "./utils/pg.js";
import type { Connection } from "./types/connection.js";
import { askForPassword } from "./utils/password.js";
import { checkAddress } from "./utils/addr.js";
import { DockerInstaller } from "./installers/docker.js";
import { StudioInstaller } from "./installers/studio.js";
import { ScriptInstaller } from "./installers/script.js";

const main = async (): Promise<void> => {
  // eslint-disable-next-line no-new -- We need to instantiate these classes
  new StudioInstaller();
  // eslint-disable-next-line no-new -- We need to instantiate these classes
  new DockerInstaller();
  // eslint-disable-next-line no-new -- We need to instantiate these classes
  new ScriptInstaller();

  const password = await askForPassword("Postgres Password");

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- We trust inquirer
  const connection: Connection = await inquirer.prompt([
    {
      type: "input",
      name: "username",
      message: "Postgres Username",
      validate: (value) => {
        if (!value) {
          return "Username is required";
        }
        return true;
      },
    },
    {
      type: "input",
      name: "database",
      message: "Postgres Database",
    },
    {
      type: "input",
      name: "host",
      message: "Postgres Host",
      default: "localhost",
      validate: (value: string) => {
        if (!value) {
          return "Host is required";
        }
        if (value === "localhost") return true;

        if (!/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.exec(value)) {
          return "Invalid host address";
        }

        return true;
      },
    },
    {
      type: "input",
      name: "port",
      message: "Postgres Port",
      default: "5432",
      validate: (value: string) => {
        if (!value) {
          return "Port is required";
        }
        if (!/^[0-9]+$/.exec(value)) {
          return "Invalid port number";
        }

        return true;
      },
    },
  ]);
  connection.password = password;

  const checkAddr = await checkAddress(connection);
  if (checkAddr) {
    logger.error("Address is already in use");
    process.exit(1);
  }

  const spinner = ora("Checking if the database already exists").start();
  const conn = await connect({
    user: connection.username,
    password: connection.password,
    database: connection.database,
    host: connection.host,
    port: connection.port,
  });

  if (!conn) {
    spinner.stop();
    logger.error("Database already exists");
    process.exit(1);
  }
  spinner.stop();

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- We trust inquirer
  const { createDatabase } = await inquirer.prompt([
    {
      type: "confirm",
      name: "createDatabase",
      message: "Do you want to create the database?",
    },
  ]);

  if (!createDatabase) {
    logger.info("Aborting installation...");
    process.exit(0);
  }

  if (DockerInstaller.instance) {
    DockerInstaller.instance.setupData(connection);
  }
  if (ScriptInstaller.instance) {
    ScriptInstaller.instance.setupData(connection);
  }
  if (StudioInstaller.instance) {
    StudioInstaller.instance.setupData(connection);
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- We trust inquirer
  const { useDocker } = await inquirer.prompt([
    {
      type: "confirm",
      name: "useDocker",
      message: "Do you want to use Docker?",
    },
  ]);
  if (!useDocker) {
    logger.error("We currently only support Docker installations, sorry!");
    process.exit(1);
  }

  if (DockerInstaller.instance) {
    await DockerInstaller.instance.install();
  }

  if (ScriptInstaller.instance) {
    await ScriptInstaller.instance.install();
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- We trust inquirer
  const { useStudio } = await inquirer.prompt([
    {
      type: "confirm",
      name: "useStudio",
      message: "Do you want to use Studio?",
    },
  ]);

  if (useStudio) {
    if (StudioInstaller.instance) {
      await StudioInstaller.instance.install();
    }
  }

  //await createFiles(connection);

  logger.success("Installation complete");
  process.exit(0);
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
