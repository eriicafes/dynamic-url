import { HTTPError } from "h3";
import { ObjectId, toObjectId } from "monarch-orm";
import { context, middleware } from "serverstruct";
import { JwtService } from "../services/jwt.ts";

export const authContext = context<{ userId: ObjectId }>();

export const authMiddleware = middleware((event, _, box) => {
  const jwt = box.get(JwtService);

  const token = event.req.headers.get("Authorization");
  if (!token) throw HTTPError.status(401);

  // validate token
  const parts = token.split("Bearer ");
  if (parts.length !== 2) throw HTTPError.status(401);

  const claims = jwt.verify(parts[1]!);
  if (!claims) throw HTTPError.status(401);

  const userId = toObjectId(claims.sub);
  if (!userId) throw HTTPError.status(401);

  // set userId in context
  authContext.set(event, { userId });
});
