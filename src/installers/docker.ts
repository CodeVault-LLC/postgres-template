import ora from "ora";
import { dockerCompose, envFile } from "~/components/files";
import { Connection } from "~/types/connection";
import { runCommand, runCommandSync } from "~/utils/cmd";
import { logger } from "~/utils/logger";
import { Installer } from "./installer";
import { connect } from "~/utils/pg";

class DockerInstaller extends Installer {
  public static instance: DockerInstaller = null;

  private hasDocker: boolean = false;
  private dockerVersion: string = "";
  private SCRIPTS_FOLDER: string = "./scripts";

  constructor() {
    super("docker");

    if (!DockerInstaller.instance) {
      DockerInstaller.instance = this;
    }
  }

  public setupData(data: Connection): void {
    this.connection = data;
  }

  /**
   * Check if Docker is installed.
   * @returns boolean
   * @private
   */
  private async findDockerVersion(): Promise<boolean> {
    const cmd = await runCommand("docker -v");

    if (cmd) {
      this.dockerVersion = cmd;
      return true;
    }

    return false;
  }

  public async install(): Promise<void> {
    this.hasDocker = await this.findDockerVersion();

    if (!this.hasDocker) {
      logger.error("Docker is not installed");
      process.exit(1);
    }

    logger.info(`Docker version ${this.dockerVersion} was found.`);
    this.createDockerFiles();

    const loader = ora("Run docker-compose up -d").start();
    runCommandSync("docker-compose up -d");
    loader.succeed("Docker is running");

    await this.safeChecks();
  }

  /**
   * Make safety checks after installation.
   * @private
   * @returns void
   */
  private async safeChecks(): Promise<void> {
    const spinner = ora("Checking if setup was successful").start();
    const conn = connect({
      user: this.connection.username,
      password: this.connection.password,
      database: this.connection.database,
      host: this.connection.host,
      port: this.connection.port,
    });

    if (!conn) {
      spinner.stop();
      logger.error("Database does not exist with the correct credentials");
      process.exit(1);
    }

    spinner.succeed("Setup was successful");
  }

  /**
   * Create docker files then run them.
   * @private
   */
  private createDockerFiles(): void {
    logger.info("Creating Docker files");
    envFile(this.connection);
    dockerCompose("dev");
    dockerCompose("prod");
  }
}

export default DockerInstaller;
