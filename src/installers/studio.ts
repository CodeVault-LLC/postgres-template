import inquirer from "inquirer";
import ora from "ora";
import type { Connection } from "~/types/connection";
import { runCommandSync } from "~/utils/cmd";
import { logger } from "~/utils/logger";
import { askForPassword } from "~/utils/password";
import { Installer } from "./installer";

class StudioInstaller extends Installer {
  public static instance: StudioInstaller | null = null;

  private password: string | null = null;
  private email: string | null = null;

  constructor() {
    super("studio");

    if (!StudioInstaller.instance) {
      StudioInstaller.instance = this;
    }
  }

  public setupData(data: Connection): void {
    this.connection = data;
  }

  public async install(): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- We trust inquirer
    const studio: {
      studio: string;
    } = await inquirer.prompt([
      {
        type: "list",
        name: "studio",
        message: "Choose a studio",
        choices: ["pgadmin", "dbeaver"],
      },
    ]);

    switch (studio.studio) {
      case "pgadmin": {
        await this.installPgAdmin();
        break;
      }
      case "dbeaver": {
        this.installDBeaver();
        break;
      }
      default: {
        throw new Error("Studio not found");
      }
    }
  }

  private pullDockerImage(image: string): void {
    try {
      const cmd = `docker pull ${image}`;
      runCommandSync(cmd);
    } catch (error) {
      logger.error("Failed to pull docker image");
    }
  }

  private async installPgAdmin(): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- We trust inquirer
    const { email }: { email: string } = await inquirer.prompt([
      {
        type: "input",
        name: "email",
        message: "Enter your email",
        validate: (input: string) => {
          if (!input.includes("@")) {
            return "Please enter a valid email";
          }
          return true;
        },
      },
    ]);
    const passwd = await askForPassword("Enter your studio password");

    this.email = email;
    this.password = passwd;

    const loader = ora("Setting up pgadmin").start();

    this.pullDockerImage("dpage/pgadmin4");

    const runCmd = `docker run --name pgadmin4 -p 80:80 -e "PGADMIN_DEFAULT_EMAIL=${
      email || "default@domain.com"
    }" -e "PGADMIN_DEFAULT_PASSWORD=${
      passwd || "default123"
    }" -d dpage/pgadmin4`;
    runCommandSync(runCmd);

    try {
      const addDbCmd = `docker exec pgadmin4 python setup.py --load-servers ${this.connection.database}`;
      runCommandSync(addDbCmd);
    } catch (error) {
      loader.fail("Failed to add database to pgadmin");
      logger.warn("Could not add database to pgadmin! Skipping...");
      return;
    } finally {
      loader.succeed("Successfully setup pgadmin");
    }
  }

  private installDBeaver(): void {
    logger.warn("DBeaver is not yet supported");
  }
}
export { StudioInstaller };
