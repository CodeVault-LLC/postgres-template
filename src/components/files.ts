import inquirer from "inquirer";
import ora from "ora";
import fs from "fs-extra";
import type { Connection } from "~/types/connection";
import { logger } from "~/utils/logger";
import { returnDockerFile } from "~/installers/image/image";

export const createFiles = async (connection: Connection): Promise<void> => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- We trust inquirer
  const files: {
    files: string[];
  } = await inquirer.prompt([
    {
      type: "checkbox",
      name: "files",
      message: "Select which files you want to create",
      choices: [
        ".env",
        "Dockerfile",
        "docker-compose.yml",
        "docker-compose.prod.yml",
      ],
    },
  ]);

  if (files.files.length === 0) {
    logger.info("No files selected");
    return;
  }

  logger.info("Creating files");

  for (const file of files.files) {
    const ll = ora(`Creating ${file}`).start();
    switch (file) {
      case ".env":
        envFile(connection);
        break;
      case "Dockerfile":
        await dockerFile(connection);
        break;
      case "docker-compose.yml":
        dockerCompose("dev", "codevault_postgres");
        break;
      case "docker-compose.prod.yml":
        dockerCompose("prod", "codevault_postgres");
        break;
    }
    ll.succeed(`Created ${file}`);
  }
};

export const dockerCompose = (
  type: "dev" | "prod",
  dockerName: string
): void => {
  fs.writeFileSync(
    `docker-compose${type === "prod" ? ".prod" : ""}.yml`,
    `version: "3"
services:
  postgres:
    image: ${dockerName || "postgres"}
    container_name: postgres
    environment:
      POSTGRES_USER: \${POSTGRES_USER}
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD}
      POSTGRES_DB: \${POSTGRES_DB}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    expose:
      - \${POSTGRES_PORT}
    ports:
      - "\${POSTGRES_PORT}:\${POSTGRES_PORT}"
    command: -p \${POSTGRES_PORT}
volumes:
  postgres_data:
`
  );
};

export const dockerFile = async (connection: Connection): Promise<void> => {
  const dockerResponse = await returnDockerFile(connection);

  fs.writeFileSync("Dockerfile", dockerResponse);
};

export const envFile = (connection: Connection): void => {
  fs.writeFileSync(
    ".env",
    `POSTGRES_USER=${connection.username}
POSTGRES_PASSWORD=${connection.password}
POSTGRES_DB=${connection.database}
POSTGRES_HOST=${connection.host}
POSTGRES_PORT=${connection.port.toString()}
`
  );
};
