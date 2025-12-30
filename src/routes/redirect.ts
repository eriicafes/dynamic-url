import bcrypt from "bcrypt";
import { onError, redirect, requireBasicAuth, toResponse } from "h3";
import { controller } from "serverstruct";
import { database } from "../db/index.ts";
import { ownerLinkContext, ownerLinkMiddleware } from "../middlewares/owner.ts";

export const redirects = controller((app, box) => {
  const db = box.get(database);

  app.use(box.get(ownerLinkMiddleware));
  app.use(onError(toResponse));

  app.get("/:username/:name", async (event) => {
    const { owner, link } = ownerLinkContext.get(event);

    // check for basic auth if link has password
    const hashedPassword = link.hashedPassword;
    if (hashedPassword) {
      await requireBasicAuth(event, {
        async validate(username, password) {
          // verify credentials
          if (username !== owner.username) {
            return false;
          }
          return await bcrypt.compare(password, hashedPassword);
        },
      });
    }

    // increment in the background
    event.waitUntil(
      db.collections.links
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
        })
    );

    // redirect to the link
    return redirect(link.url);
  });
});
