import { defineConfig } from "tsup";

const isDev = process.env.npm_lifecycle_event === "dev";

// eslint-disable-next-line import/no-default-export -- Just a config
export default defineConfig({
  clean: true,
  entry: ["src/index.ts"],
  format: ["esm"],
  minify: !isDev,
  target: "esnext",
  outDir: "dist",
  onSuccess: isDev ? "node dist/index.js" : undefined,
});
