import { HTTPException } from "hono/http-exception";
import { createModule } from "serverstruct";
import { auth } from "./routes/auth";
import { links } from "./routes/links";
import { redirects } from "./routes/redirect";
import { JwtService } from "./services/jwt";
import { Middlewares } from "./services/middlewares";

export const app = createModule()
  .provide({
    jwt: JwtService,
    middlewares: Middlewares,
  })
  .submodules({ auth, links, redirects })
  .route((app, _, modules) => {
    return app
      .get("/ping", (c) => {
        return c.text("pong");
      })
      .route("/auth", modules.auth)
      .route("/links", modules.links)
      .route("/r", modules.redirects)
      .onError((err, c) => {
        const exception =
          err instanceof HTTPException ? err : new HTTPException(500);

        if (exception.res) return exception.res;

        if (!exception.message) {
          return c.body(null, exception.status);
        }
        return c.json({ message: err.message }, exception.status);
      });
  })
  .app();
