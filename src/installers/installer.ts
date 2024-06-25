import type { Connection } from "~/types/connection";

/**
 * Abstract class for installers. All installers should extend this class.
 */
export abstract class Installer {
  public connection: Connection;
  public installerName: string;

  constructor(name: string) {
    this.installerName = name;
  }

  /**
   * Abstract method for setting up the data.
   */
  public abstract setupData(data: Connection): void;

  /**
   * Abstract method for installing the project.
   */
  public abstract install(): void;
}
