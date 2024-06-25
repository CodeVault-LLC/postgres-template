export type OS = "darwin" | "linux" | "win32";

export const findOS = (): OS => {
  const os = process.platform;

  if (os === "darwin") {
    return "darwin";
  }

  if (os === "linux") {
    return "linux";
  }

  if (os === "win32") {
    return "win32";
  }

  throw new Error("Unsupported OS found");
};
