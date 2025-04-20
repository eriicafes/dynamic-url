import "dotenv/config";

type Config = {
  port: number;
  dbUrl: string;
};

export function getConfig(): Config {
  const port = process.env.PORT ?? "4000";
  const dbUrl = process.env.DB_URL ?? "mongodb://localhost:27017/dynamic-url";

  return {
    port: parseInt(port),
    dbUrl,
  };
}
