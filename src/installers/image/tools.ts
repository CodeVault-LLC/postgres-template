import inquirer from "inquirer";

export const verifiedTools: string[] = ["curl", "wget", "jq", "git"];

export const addTools = async (): Promise<string> => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- We trust inquirer
  const {
    tools,
  }: {
    tools: string[];
  } = await inquirer.prompt([
    {
      type: "checkbox",
      name: "tools",
      message: "Select tools to install",
      choices: [...verifiedTools],
    },
  ]);

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
