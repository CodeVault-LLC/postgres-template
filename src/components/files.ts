import fs from "fs-extra";
import type { Connection } from "~/types/connection";
import { returnDockerFile } from "~/installers/image/image";
import type { Mode } from "~/types/mode";

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

export const dockerFile = async (
  connection: Connection,
  mode: Mode
): Promise<void> => {
  const dockerResponse = await returnDockerFile(connection, mode);

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
