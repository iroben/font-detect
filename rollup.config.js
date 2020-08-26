export default {
  input: "src/index.js",
  output: [
    {
      file: "dist/font-detect.cjs.js",
      format: "cjs",
    },
    {
      file: "dist/font-detect.esm.js",
      format: "esm",
    },
    {
      name: "FontDetect",
      file: "dist/font-detect.umd.js",
      format: "umd",
    },
    {
      file: "dist/font-detect.amd.js",
      format: "amd",
    }
    
  ],
};
