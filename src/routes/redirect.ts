import { HTTPException } from "hono/http-exception";
import { createModule } from "serverstruct";
import { database } from "../db/db";
import { JwtService } from "../services/jwt";

export const redirects = createModule()
  .use<{ jwt: JwtService }>()
  .route((app) => {
    return app.get("/:username/:name", async (c) => {
      // get the link
      const { username, name } = c.req.param();

      const owner = await database.collections.users
        .findOne({
          username,
        })
        .select({ username: true });
      if (!owner) throw new HTTPException(404);

      const link = await database.collections.links.findOne({
        userId: owner._id,
        name,
      });
      if (!link) throw new HTTPException(404);

      // TODO: check if user is authorized
      console.log(link);

      // redirect to the link
      return c.redirect(link?.url);
    });
  });
