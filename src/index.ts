import ora from "ora";
import inquirer from "inquirer";
import { logger } from "./utils/logger.js";
import { connect } from "./utils/pg.js";
import { Connection } from "./types/connection.js";
import { askForPassword } from "./utils/password.js";
import { checkAddress } from "./utils/addr.js";
import DockerInstaller from "./installers/docker.js";
import StudioInstaller from "./installers/studio.js";
import ScriptInstaller from "./installers/script.js";

const main = async () => {
  new StudioInstaller();
  new DockerInstaller();
  new ScriptInstaller();

  const password = await askForPassword("Postgres Password");

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
      validate: (value) => {
        if (!value) {
          return "Host is required";
        }
        if (value === "localhost") return true;

        if (!value.match(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/)) {
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
      validate: (value) => {
        if (!value) {
          return "Port is required";
        }
        if (!value.match(/^[0-9]+$/)) {
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
  const conn = connect({
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

  DockerInstaller.instance.setupData(connection);
  ScriptInstaller.instance.setupData(connection);
  StudioInstaller.instance.setupData(connection);

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

  await DockerInstaller.instance.install();
  await ScriptInstaller.instance.install();

  const { useStudio } = await inquirer.prompt([
    {
      type: "confirm",
      name: "useStudio",
      message: "Do you want to use Studio?",
    },
  ]);

  if (useStudio) {
    StudioInstaller.instance.install();
  }

  //await createFiles(connection);

  logger.success("Installation complete");
  process.exit(0);
};

main().catch((err) => {
  logger.error("Aborting installation...");
  if (err instanceof Error) {
    logger.error(err);
  } else {
    logger.error(
      "An unknown error has occurred. Please open an issue on github with the below:"
    );
    console.log(err);
  }
  process.exit(1);
});
