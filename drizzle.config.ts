import { type Config } from "drizzle-kit";

import { env } from "@/env";

export default {
  schema: "./src/server/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: env.AUTH_DRIZZLE_URL,
  },
  tablesFilter: ["t3-starter-template_*"],
} satisfies Config;
