import inquirer from "inquirer";
import fs from "fs-extra";
import ora from "ora";
import { runCommandSync } from "~/utils/cmd";
import { logger } from "~/utils/logger";
import { generateSSL } from "~/utils/ssl";
import type { Connection } from "~/types/connection";
import type { Mode } from "~/types/mode";
import { Installer } from "./installer";

class ScriptInstaller extends Installer {
  public static instance: ScriptInstaller | null = null;
  private SCRIPT_FOLDER = "./scripts";
  private FILE_FOLDER = "./ca_files";

  private scripts = new Map<string, string>();
  private verifiedScripts: string[] = [
    "configure_ssl.sh",
    "backup_db.sh",
    "create_user.sh",
    "tune_postgresql.sh",
  ];
  private enabledScripts: string[] = [];

  constructor() {
    super("script");

    if (!ScriptInstaller.instance) {
      ScriptInstaller.instance = this;
    }
  }

  /**
   * Move script to Docker.
   * @public
   * @returns void
   */
  public moveScriptToDocker(file: string): void {
    const loader = ora("Moving scripts to Docker").start();

    runCommandSync("docker exec postgres mkdir /scripts -p");

    runCommandSync(
      `docker cp ${this.SCRIPT_FOLDER}/${file} postgres:/scripts/${file}`
    );

    loader.succeed("Moved scripts to Docker");
  }

  /**
   * Move a general file to Docker.
   * @public
   * @returns void
   */
  public moveFileToDocker(file: string): void {
    const loader = ora("Moving file to Docker").start();
    runCommandSync("docker exec postgres mkdir /ca_files -p");

    runCommandSync(`docker cp ${file} postgres:${file.replace("./", "/")}`);

    loader.succeed("Moved file to Docker");
  }

  private async runConfigureSSL(): Promise<void> {
    // Create a custom SSL Key, Certificate, and CA
    const ssl = {
      country: "US",
      state: "CA",
      city: "San Francisco",
      organization: "Test",
      organizationUnit: "Test",
      commonName: "localhost",
      emailAddress: "",
    };

    if (!fs.existsSync(this.FILE_FOLDER)) {
      fs.mkdirSync(this.FILE_FOLDER);
    }

    const { keyPath, certPath, caPath } = await generateSSL(
      ssl,
      this.FILE_FOLDER
    );

    this.moveFileToDocker(keyPath);
    this.moveFileToDocker(certPath);
    this.moveFileToDocker(caPath);

    const loader = ora("Running configureSSL").start();
    const cmd = runCommandSync(
      "docker exec postgres /scripts/configure_ssl.sh /ca_files/ssl_key.pem /ca_files/ssl_cert.pem /ca_files/ssl_ca_cert.pem"
    );
    if (!cmd) {
      loader.fail("Failed to run configureSSL script");
      process.exit(1);
    }

    loader.succeed("Ran configureSSL script");
  }

  /**
   * Run script in Docker.
   * @public
   * @returns void
   */
  public async runDockerScript(file: string): Promise<void> {
    if (!this.verifiedScripts.includes(file)) {
      const loader = ora(`Running ${file}`).start();

      const cmd = runCommandSync(`docker exec postgres /scripts/${file}`);

      if (!cmd) {
        loader.fail(`Failed to run ${file}`);
        process.exit(1);
      }

      loader.succeed(`Ran ${file}`);
    }

    switch (file) {
      case "configure_ssl.sh":
        await this.runConfigureSSL();
        break;
      default:
        logger.info("No script found");
        break;
    }
  }

  private loadScripts(): void {
    fs.readdirSync(this.SCRIPT_FOLDER).forEach((file) => {
      const script = fs.readFileSync(`${this.SCRIPT_FOLDER}/${file}`, "utf-8");
      this.scripts.set(file, script);
    });
  }

  public setupData(data: Connection): void {
    this.connection = data;
  }
  public async install(_mode: Mode): Promise<void> {
    this.loadScripts();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- We trust inquirer
    const {
      enabledScripts,
    }: {
      enabledScripts: string[];
    } = await inquirer.prompt([
      {
        type: "checkbox",
        name: "enabledScripts",
        message: "Choose scripts to run",
        choices: Array.from(this.scripts.keys()),
      },
    ]);
    this.enabledScripts = enabledScripts;

    for (const key of this.enabledScripts) {
      this.moveScriptToDocker(key);
      const ll = ora("Running scripts in Docker").start();
      await this.runDockerScript(key);
      ll.succeed("Ran scripts in Docker");
    }

    logger.info("Finished running scripts");
  }
}

export { ScriptInstaller };
