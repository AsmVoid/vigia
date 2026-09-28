import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: process.env.PRISMA_SEED !== "false" ? "tsx prisma/seed.ts" : undefined,
  },
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
