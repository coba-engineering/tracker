import { terser } from "rollup-plugin-terser";

export default {
  input: "src/index.js",
  output: [
    { file: "dist/library.js", format: "cjs" },
    { file: "dist/library.min.js", format: "cjs", plugins: [terser()] },
  ],
};
