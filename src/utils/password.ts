import inquirer from "inquirer";
import crypto from "crypto";

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

export const askForPassword = async (message: string): Promise<string> => {
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

  const { password } = await inquirer.prompt([
    {
      type: "password",
      name: "password",
      message,
    },
    {
      type: "password",
      name: "confirmPassword",
      message: "Please confirm your password",
      validate: (value, answers) => {
        if (value !== answers.password) {
          return "Passwords do not match";
        }
      },
    },
  ]);

  return password;
};
