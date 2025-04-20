import bcrypt from "bcrypt";
import { basicAuth } from "hono/basic-auth";
import { InferOutput } from "monarch-orm";
import { createModule } from "serverstruct";
import { database } from "../db/db";
import { Middlewares } from "../services/middlewares";

export const redirects = createModule()
  .use<{ middlewares: Middlewares }>()
  .route((app, { middlewares }) => {
    return app.get(
      "/:username/:name",
      middlewares.ownerLink(),
      basicAuth({
        async verifyUser(username, password, c) {
          const owner = c.get("owner") as InferOutput<
            typeof database,
            "users",
            { select: { username: true } }
          >;
          const link = c.get("link") as InferOutput<
            typeof database,
            "links",
            {}
          >;

          if (username !== owner.username) return false;
          if (link.hashedPassword) {
            const verified = await bcrypt.compare(
              password,
              link.hashedPassword
            );
            return verified;
          }
          return true;
        },
      }),
      async (c) => {
        const link = c.get("link");

        // increment in the background
        // TODO: should be in a queue
        database.collections.links
          .updateOne(
            {
              _id: link._id,
            },
            {
              $inc: {
                views: 1,
              },
            }
          )
          .exec()
          .catch((err) => {
            console.log("Failed to update view count:", err);
          });

        // redirect to the link
        // @ts-ignore
        return c.redirect(link.url);
      }
    );
  });
