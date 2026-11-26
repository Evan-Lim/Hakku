import type { Config } from "tailwindcss";
import { preset } from "@govtechmy/myds-style";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,jsx,ts,tsx,mdx}",
    "./node_modules/@govtechmy/myds-react/dist/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [preset as unknown as Partial<Config>],
  theme: {
    extend: {
      fontFamily: {
        heading: ["Poppins", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
    },
  },
};

export default config;
