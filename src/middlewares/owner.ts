import { getValidatedRouterParams, HTTPError } from "h3";
import type { InferOutput } from "monarch-orm";
import { context, middleware } from "serverstruct";
import z from "zod";
import { database, type DB } from "../db/index.ts";

type Owner = InferOutput<DB, "users", { select: { username: true } }>;
type OwnerLink = InferOutput<DB, "links", { omit: {} }>;

export const ownerLinkContext = context<{ owner: Owner; link: OwnerLink }>();

export const ownerLinkMiddleware = middleware(async (event, _, box) => {
  const db = box.get(database);

  const params = await getValidatedRouterParams(
    event,
    z.object({
      username: z.string(),
      name: z.string(),
    })
  );

  const owner = await db.collections.users
    .findOne({ username: params.username })
    .select({ username: true });
  if (!owner) throw HTTPError.status(404);

  const link = await db.collections.links
    .findOne({
      userId: owner._id,
      name: params.name,
    })
    .omit({});
  if (!link) throw HTTPError.status(404);

  ownerLinkContext.set(event, { owner, link });
});
