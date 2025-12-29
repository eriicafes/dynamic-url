import { onError } from "h3";
import { application } from "serverstruct";
import { auth } from "./routes/auth.ts";
import { links } from "./routes/links.ts";
import { redirects } from "./routes/redirect.ts";

export const app = application((app, box) => {
  app.use(
    onError((err, event) => {
      if (err.unhandled) {
        console.log("Error:", event.req.method, event.req.url, err.cause);
        return { message: "Something went wrong" };
      }
      return { message: err.message };
    })
  );

  app.get("/ping", () => "pong");
  app.mount("/auth", box.get(auth));
  app.mount("/links", box.get(links));
  app.mount("/r", box.get(redirects));
});
