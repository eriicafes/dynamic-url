import "dotenv/config";
import { factory, type ConstructorInstanceType } from "getbox";
import z from "zod";

export type AppConfig = ConstructorInstanceType<typeof appConfig>;

export const appConfig = factory(() => {
  const schema = z.object({
    PORT: z.coerce.number().default(4000),
    DB_URL: z.string(),
    SECRET: z.string(),
  });

  const { data, success, error } = schema.safeParse(process.env);
  if (!success) throw error;
  return data;
});
