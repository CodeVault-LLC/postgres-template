import inquirer from "inquirer";
import ora from "ora";
import { Connection } from "~/types/connection";
import fs from "fs-extra";
import { logger } from "~/utils/logger";

export const createFiles = async (connection: Connection) => {
  const files = await inquirer.prompt([
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
        await envFile(connection);
        break;
      case "Dockerfile":
        await dockerFile();
        break;
      case "docker-compose.yml":
        await dockerCompose("dev");
        break;
      case "docker-compose.prod.yml":
        await dockerCompose("prod");
        break;
    }
    ll.succeed(`Created ${file}`);
  }
};

export const dockerCompose = async (type: "dev" | "prod") => {
  fs.writeFileSync(
    `docker-compose${type === "prod" ? ".prod" : ""}.yml`,
    `version: "3.8"
services:
  postgres:
    image: postgres:13
    container_name: postgres
    environment:
      POSTGRES_USER: \${POSTGRES_USER}
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD}
      POSTGRES_DB: \${POSTGRES_DB}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "\${POSTGRES_PORT}:\${POSTGRES_PORT}"

volumes:
  postgres_data:
`
  );
};

const dockerFile = async () => {
  logger.error("Not implemented yet");
};

export const envFile = async (connection: Connection) => {
  fs.writeFileSync(
    ".env",
    `POSTGRES_USER=${connection.username}
POSTGRES_PASSWORD=${connection.password}
POSTGRES_DB=${connection.database}
POSTGRES_HOST=${connection.host}
POSTGRES_PORT=${connection.port}
`
  );
};
