import { factory } from "getbox";
import { defineMiddleware, getValidatedRouterParams, HTTPError } from "h3";
import type { InferOutput } from "monarch-orm";
import z from "zod";
import { Context } from "../context.ts";
import { database, type Link } from "../db/index.ts";

type Owner = InferOutput<
  typeof database,
  "users",
  { select: { username: true } }
>;

export const ownerLinkContext = new Context<{ owner: Owner; link: Link }>();

export const ownerLinkMiddleware = factory(() => {
  return defineMiddleware(async (event) => {
    const params = await getValidatedRouterParams(
      event,
      z.object({
        username: z.string(),
        name: z.string(),
      })
    );

    const owner = await database.collections.users
      .findOne({ username: params.username })
      .select({ username: true });
    if (!owner) throw HTTPError.status(404);

    const link = await database.collections.links.findOne({
      userId: owner._id,
      name: params.name,
    });
    if (!link) throw HTTPError.status(404);

    ownerLinkContext.set(event, { owner, link });
  });
});
