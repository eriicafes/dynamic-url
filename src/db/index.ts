import { factory, type ConstructorInstanceType } from "getbox";
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

export const database = factory((box) => {
  const { DB_URL } = box.get(appConfig);
  const client = createClient(DB_URL);

  return createDatabase(client.db(), {
    users,
    userRelations,
    links,
    linksRelations,
  });
});

export type DB = ConstructorInstanceType<typeof database>;
export type User = InferOutput<DB, "users", { omit: { hashedPassword: true } }>;
export type Link = InferOutput<DB, "links", { omit: { hashedPassword: true } }>;
