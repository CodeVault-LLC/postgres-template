import type { Connection } from "~/types/connection";
import { addTools } from "./tools";
import { addExtensions } from "./extensions";

export const baseDockerImage = `# Base PostgreSQL 16 Image
FROM postgres:16
`;

export const credentails = (
  connection: Connection
): string => `# Set the environment variables
ENV POSTGRES_USER=${connection.username}
ENV POSTGRES_PASSWORD=${connection.password}
ENV POSTGRES_DB=${connection.database}
ENV POSTGRES_HOST=${connection.host}
ENV POSTGRES_PORT=${connection.port.toString()}

# Expose the port
EXPOSE ${connection.port.toString()}
`;

export const returnDockerFile = async (
  connection: Connection
): Promise<string> => {
  const base = baseDockerImage;
  const creds = credentails(connection);
  const tools = await addTools();
  const extensions = await addExtensions();

  return `${base}
${creds}

# Update package lists
RUN apt-get update

${tools}

${extensions}

# Cleanup
RUN apt-get clean && rm -rf /var/lib/apt/lists/*
`;
};
