import ora from "ora";
import { getClient } from "~/utils/pg";

type Props = {
  generateUsers: number;
  removeUsers: boolean;
};

const generateStrings = (length: number) => {
  const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export const Test = (props: Props) => {
  const client = getClient();

  const generateUsers = async () => {
    const loader = ora("Generating users").start();
    const { generateUsers } = props;
    const query = `INSERT INTO users (name, email) VALUES (${generateStrings(
      10
    )}, ${generateStrings(10)})`;
    for (let i = 0; i < generateUsers; i++) {
      await client.query(query);
    }

    loader.succeed("Users have been generated");
  };

  const removeUsers = async () => {
    const loader = ora("Removing users").start();
    await client.query("DELETE FROM users");
    loader.succeed("Users have been removed");
  };

  const main = async () => {
    if (props.generateUsers) {
      await generateUsers();
    }

    if (props.removeUsers) {
      await removeUsers();
    }
  };

  main();
};
