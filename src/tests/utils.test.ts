 
import { expect, test } from "vitest";
import { checkAddress } from "~/utils/addr";
import { runCommand, runCommandSync } from "~/utils/cmd";

test("Check Address", async () => {
  expect(
    await checkAddress({
      database: "test",
      host: "localhost",
      password: "password",
      port: 135,
      username: "username",
    })
  ).toBe(true);

  expect(
    await checkAddress({
      database: "test",
      host: "localhost",
      password: "password",
      port: 12313,
      username: "username",
    })
  ).toBe(false);
});

test("Commands", async () => {
  expect(await runCommand("echo Hello World")).toBe("Hello World\r\n");
  expect(runCommand("echo Hello World")).toBeInstanceOf(Promise);
  void expect(runCommand("echoooooo")).rejects.toThrowError();

  expect(runCommandSync("echoooooo")).toBeUndefined();
  expect(runCommandSync("echo Hello World")).toBe("Hello World\r\n");
  expect(runCommandSync("echo Hello World")).toBeTypeOf("string");
});

