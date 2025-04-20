import { createModule } from "serverstruct";
import { auth } from "./routes/auth";

export const app = createModule()
  .submodules({ auth })
  .route((app, _, modules) => {
    return app
      .get("/ping", (c) => {
        return c.text("pong");
      })
      .route("/auth", modules.auth);
  })
  .app();
