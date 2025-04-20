import { createClient, createDatabase, createRelations } from "monarch-orm";
import { appConfig } from "../config";
import { links } from "./links";
import { users } from "./users";

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

// TODO: change this
const client = createClient(appConfig.dbUrl);

export const database = createDatabase(client.db(), {
  users,
  userRelations,
  links,
  linksRelations,
});
