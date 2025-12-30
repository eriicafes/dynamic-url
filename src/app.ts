import { HTTPError, onError } from "h3";
import { application } from "serverstruct";
import { appConfig } from "./config.ts";
import { auth } from "./routes/auth.ts";
import { links } from "./routes/links.ts";
import { redirects } from "./routes/redirect.ts";

export const app = application((app, box) => {
  app.use(
    onError((err, event) => {
      if (err.unhandled) {
        console.log("Error:", event.req.method, event.req.url, err.cause);
        return { error: "Something went wrong" };
      }
      return { error: err.message, ...err.body };
    })
  );

  app.get("/ping", () => "pong");
  app.mount("/auth", box.get(auth));
  app.mount("/links", box.get(links));
  app.mount("/r", box.get(redirects));
  app.all("**", () => {
    throw new HTTPError("Not found", { status: 404 });
  });
});

const { PORT } = app.box.get(appConfig);
app.serve({ port: PORT });
