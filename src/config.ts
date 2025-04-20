import "dotenv/config";

type Config = {
  port: number;
};

export function getConfig(): Config {
  const port = process.env.PORT ?? "4000";

  return {
    port: parseInt(port),
  };
}
