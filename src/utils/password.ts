import crypto from "node:crypto";
import inquirer from "inquirer";

export const generatePassword = async (): Promise<string> => {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(64, (err, buffer) => {
      if (err) {
        reject(err);
      } else {
        resolve(buffer.toString("hex"));
      }
    });
  });
};

export const askForPassword = async (
  message: string,
  askPassword: boolean
): Promise<string> => {
  if (askPassword) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- We trust inquirer
    const { wantGenerate } = await inquirer.prompt([
      {
        type: "confirm",
        name: "wantGenerate",
        message: "Would you like to generate a password?",
      },
    ]);

    if (wantGenerate) {
      return generatePassword();
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- We trust inquirer
  const { password }: { password: string } = await inquirer.prompt([
    {
      type: "password",
      name: "password",
      message,
    },
    {
      type: "password",
      name: "confirmPassword",
      message: "Please confirm your password",
      validate: (
        value: string,
        answers: {
          password: string;
        }
      ) => {
        if (value !== answers.password) {
          return "Passwords do not match";
        }
      },
    },
  ]);

  return password;
};
