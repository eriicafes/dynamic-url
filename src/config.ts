import "dotenv/config";
import z from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  DB_URL: z.string(),
  SECRET: z.string(),
});

const { data, success, error } = envSchema.safeParse(process.env);

if (!success) {
  throw new Error("Invalid environment variables:", error);
}

export const appConfig = {
  port: data.PORT,
  secret: data.SECRET,
  dbUrl: data.DB_URL,
} as const;

export type AppConfig = typeof appConfig;
