import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#172126",
        surface: "#f7f3ec",
        panel: "#fffaf1",
        mint: "#4fae8a",
        coral: "#ef6f61",
        steel: "#45616f",
        lemon: "#f5c84c"
      },
      boxShadow: {
        soft: "0 18px 60px rgba(23, 33, 38, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
