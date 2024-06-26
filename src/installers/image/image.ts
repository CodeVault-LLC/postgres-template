import inquirer from "inquirer";
import type { Connection } from "~/types/connection";
import { verifiedTools } from "./tools";

export const baseDockerImage = `# Base PostgreSQL 16 Image
FROM postgres:16
`;

export const credentails = (connection: Connection): string => `
# Set the environment variables
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

  // Setup a command to add general tools to the image, (key is the name of the tool, value is the command to install it)
  // The command should look something like this at the end:
  /*
    RUN apt-get install -y --no-install-recommends \

  */
  const tools = await addTools();

  return `${base}
# Update package lists
RUN apt-get update

# Install tools
RUN apt-get install -y --no-install-recommends \\
${tools.length < 1 ? "" : tools
  .map(
    (tool, index) =>
      `${index === tools.length - 1 ? "    " : "    "}${tool}${
        index === tools.length - 1 ? "" : " \\\n"
      }`
  )
  .join("")}
${creds}
`;
};

export const addTools = async (): Promise<string[]> => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- We trust inquirer
  const tools: {
    tools: string[];
  } = await inquirer.prompt([
    {
      type: "checkbox",
      name: "tools",
      message: "Select tools to install",
      choices: [...verifiedTools],
    },
  ]);

  return tools.tools;
};
