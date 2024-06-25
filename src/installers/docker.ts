import ora from "ora";
import { dockerCompose, envFile } from "~/components/files";
import { connect } from "~/utils/pg";
import type { Connection } from "~/types/connection";
import { runCommand, runCommandSync } from "~/utils/cmd";
import { logger } from "~/utils/logger";
import { Installer } from "./installer";

class DockerInstaller extends Installer {
  public static instance: DockerInstaller | null = null;

  private hasDocker = false;
  private dockerVersion = "";

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
  }

  /**
   * Make safety checks after installation.
   * @returns void
   */
  private async safeChecks(): Promise<void> {
    const spinner = ora("Checking if setup was successful").start();
    logger.info(JSON.stringify(this.connection));
    const conn = await connect({
      username: this.connection.username,
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
   */
  private createDockerFiles(): void {
    logger.info("Creating Docker files");
    envFile(this.connection);
    dockerCompose("dev");
    dockerCompose("prod");
  }
}

export { DockerInstaller };
