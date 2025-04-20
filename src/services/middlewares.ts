import { MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { ObjectId, toObjectId } from "monarch-orm";
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
}
