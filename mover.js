import fs from "fs-extra";

const files = ["README.md", "LICENSE"];
const folders = ["scripts"];

const copyFiles = async (output) => {
  try {
    files.forEach((file) => {
      fs.copySync(file, `./${output}/${file}`);
    });

    folders.forEach((folder) => {
      fs.copySync(folder, `./${output}/${folder}`);
    });
  } catch (err) {
    console.error(err);
  }
};

copyFiles("dist");
