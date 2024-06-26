import inquirer from "inquirer";
import type { Mode } from "~/types/mode";

interface Tool {
  name: string;
  modes: Mode[]; // The mode which the tool will be installed on automatically
}

export const verifiedTools: Tool[] = [
  {
    name: "git",
    modes: ["development", "production"],
  },
  {
    name: "curl",
    modes: ["production"],
  },
  {
    name: "wget",
    modes: ["development", "production"],
  },
  {
    name: "jq",
    modes: ["development", "production"],
  },
  {
    name: "vim",
    modes: ["production"],
  },
];

export const addTools = async (mode: Mode): Promise<string> => {
  let tools: string[] = verifiedTools
    .filter((tool) => tool.modes.includes(mode))
    .map((tool) => tool.name);

  if (mode === "custom") {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- We trust inquirer
    tools = await inquirer.prompt([
      {
        type: "checkbox",
        name: "tools",
        message: "Select tools to install",
        choices: [...verifiedTools],
      },
    ]);
  }

  return `# Install tools
RUN apt-get install -y --no-install-recommends \\
${
  tools.length < 1
    ? ""
    : tools
        .map(
          (tool, index) =>
            `${index === tools.length - 1 ? "    " : "    "}${tool}${
              index === tools.length - 1 ? "" : " \\\n"
            }`
        )
        .join("")
}
`;
};
