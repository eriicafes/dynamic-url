import { serve } from "@hono/node-server";
import { app } from "./app";
import { getConfig } from "./config";

function main() {
  const config = getConfig();

  serve(
    {
      fetch: app.fetch,
      port: config.port,
    },
    (listener) => {
      console.log(`app listening on port`, listener.port);
    }
  );
}
main();
