import { serve } from "@hono/node-server";
import { app } from "./app";
import { appConfig } from "./config";

function main() {
  serve(
    {
      fetch: app.fetch,
      port: appConfig.port,
    },
    (listener) => {
      console.log(`app listening on port`, listener.port);
    }
  );
}
main();
