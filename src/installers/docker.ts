import ora from "ora";
import { dockerCompose, dockerFile, envFile } from "~/components/files";
import type { Connection } from "~/types/connection";
import { runCommand, runCommandSync } from "~/utils/cmd";
import { logger } from "~/utils/logger";
import { Installer } from "./installer";

class DockerInstaller extends Installer {
  public static instance: DockerInstaller | null = null;

  private hasDocker = false;
  private dockerVersion = "";
  private dockerFileName = "codevault_postgres";

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
    await this.createDockerFiles();

    const loader = ora("Run docker-compose up -d").start();
    runCommandSync("docker-compose up -d");
    loader.succeed("Docker is running");
  }

  /**
   * Create docker files then run them.
   */
  private async createDockerFiles(): Promise<void> {
    logger.info("Creating Docker files");
    envFile(this.connection);
    await dockerFile(this.connection);

    // Run the docker file with a special name.
    const loader = ora("Building Docker image").start();
    runCommandSync(`docker build -t ${this.dockerFileName} .`);
    loader.succeed("Docker image built");

    dockerCompose("dev", this.dockerFileName);
    dockerCompose("prod", this.dockerFileName);
  }
}

export { DockerInstaller };
