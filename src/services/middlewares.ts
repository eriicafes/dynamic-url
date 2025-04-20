import { MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { InferOutput, ObjectId, toObjectId } from "monarch-orm";
import { database } from "../db/db";
import { JwtService } from "./jwt";

export class Middlewares {
  constructor(public ctx: { jwt: JwtService }) {}

  public auth(): MiddlewareHandler<{ Variables: { userId: ObjectId } }> {
    return async (c, next) => {
      const token = c.req.header("Authorization");
      const err = new HTTPException(401, {
        message: "Unauthorized",
      });
      if (!token) throw err;

      // validate token
      const parts = token.split("Bearer ");
      if (parts.length !== 2) throw err;

      const claims = this.ctx.jwt.verify(parts[1]!);
      if (!claims) throw err;

      const userId = toObjectId(claims.sub);
      if (!userId) throw err;

      // set user in context
      c.set("userId", userId);

      return next();
    };
  }

  public ownerLink(): MiddlewareHandler<
    {
      Variables: {
        owner: InferOutput<
          typeof database,
          "users",
          { select: { username: true } }
        >;
        link: InferOutput<typeof database, "links", {}>;
      };
    },
    "/:username/:name"
  > {
    return async (c, next) => {
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

      c.set("owner", owner);
      c.set("link", link);
      return next();
    };
  }
}
