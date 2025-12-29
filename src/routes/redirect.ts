import bcrypt from "bcrypt";
import { HTTPResponse, redirect } from "h3";
import { controller } from "serverstruct";
import { database } from "../db/index.ts";
import { ownerLinkContext, ownerLinkMiddleware } from "../middlewares/owner.ts";

export const redirects = controller((app, box) => {
  app.use(box.get(ownerLinkMiddleware));

  app.get("/:username/:name", async (event) => {
    const { owner, link } = ownerLinkContext.get(event);

    // check for basic auth if link has password
    if (link.hashedPassword) {
      const authorization = event.req.headers.get("Authorization");

      if (!authorization || !authorization.startsWith("Basic ")) {
        return new HTTPResponse(null, {
          status: 401,
          headers: {
            "WWW-Authenticate": 'Basic realm="Secure Link"',
          },
        });
      }

      // decode basic auth
      const base64Credentials = authorization.slice(6);
      const credentials = Buffer.from(base64Credentials, "base64").toString(
        "utf-8"
      );
      const [username, password] = credentials.split(":");

      // verify credentials
      if (username !== owner.username || !password) {
        return new HTTPResponse(null, {
          status: 401,
          headers: {
            "WWW-Authenticate": 'Basic realm="Secure Link"',
          },
        });
      }

      const verified = await bcrypt.compare(password, link.hashedPassword);
      if (!verified) {
        return new HTTPResponse(null, {
          status: 401,
          headers: {
            "WWW-Authenticate": 'Basic realm="Secure Link"',
          },
        });
      }
    }

    // increment in the background
    event.waitUntil(
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
        })
    );

    // redirect to the link
    return redirect(link.url);
  });
});
