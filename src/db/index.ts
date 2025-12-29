import {
  createClient,
  createDatabase,
  createRelations,
  type InferOutput,
} from "monarch-orm";
import { appConfig } from "../config.ts";
import { links } from "./links.ts";
import { users } from "./users.ts";

// define relations
const userRelations = createRelations(users, ({ ref }) => {
  return {
    links: ref(links, { field: "_id", references: "userId" }),
  };
});

const linksRelations = createRelations(links, ({ ref }) => {
  return {
    user: ref(users, { field: "userId", references: "_id" }),
  };
});

const client = createClient(appConfig.dbUrl);

export const database = createDatabase(client.db(), {
  users,
  userRelations,
  links,
  linksRelations,
});

export type User = InferOutput<typeof database, "users">;
export type Link = InferOutput<typeof database, "links", { omit: {} }>;
