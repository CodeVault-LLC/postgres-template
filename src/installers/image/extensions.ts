import inquirer from "inquirer";

export const verifiedExtensions: string[] = [
  "postgresql-16-pgvector",
  "postgresql-16-postgis",
];

export const addExtensions = async (): Promise<string> => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- We trust inquirer
  const {
    extensions,
  }: {
    extensions: string[];
  } = await inquirer.prompt([
    {
      type: "checkbox",
      name: "extensions",
      message: "Select extensions to install",
      choices: [...verifiedExtensions],
    },
  ]);

  return `# Install extensions
RUN apt-get install postgresql-contrib

RUN apt-get install -y --no-install-recommends \\
${
  extensions.length < 1
    ? ""
    : extensions
        .map(
          (tool, index) =>
            `${index === extensions.length - 1 ? "    " : "    "}${tool}${
              index === extensions.length - 1 ? "" : " \\\n"
            }`
        )
        .join("")
}`;
};
