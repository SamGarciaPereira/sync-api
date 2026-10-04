import dotenv from "dotenv";
import { defineConfig } from "prisma/config";

dotenv.config();

export default defineConfig({
  schema: "infra",
  migrations: {
    path: "infra/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL ?? "",
  },
});
