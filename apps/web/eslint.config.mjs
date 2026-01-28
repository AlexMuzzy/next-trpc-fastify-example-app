import nextConfig from "eslint-config-next";
import coreWebVitals from "eslint-config-next/core-web-vitals";
import tsConfig from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextConfig,
  ...coreWebVitals,
  ...tsConfig,
  {
    ignores: ["node_modules/**", ".next/**", "out/**", "build/**"],
  },
];

export default eslintConfig;
