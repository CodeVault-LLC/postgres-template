import inquirer from "inquirer";
import { DockerInstaller } from "~/installers/docker";
import { ScriptInstaller } from "~/installers/script";
import type { Connection } from "~/types/connection";
import { askForPassword } from "~/utils/password";

/**
 * This function handles the connection to the database
 * @param askPassword - Whether to ask for the password or not.
 * @returns The connection object.
 */
export const handleConnection = async (
  askPassword: boolean
): Promise<Connection> => {
  const password = await askForPassword("Postgres Password", askPassword);

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

  if (DockerInstaller.instance) {
    DockerInstaller.instance.setupData(connection);
  }
  if (ScriptInstaller.instance) {
    ScriptInstaller.instance.setupData(connection);
  }

  return connection;
};
