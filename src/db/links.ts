import { createSchema } from "monarch-orm";
import { objectId, string } from "monarch-orm/types";

export const links = createSchema("links", {
  url: string(),
  name: string(),
  userId: objectId(),
  // TODO: extra fields
}).indexes(({ createIndex }) => {
  return {
    userLinkName: createIndex({ userId: 1, name: 1 }, { unique: true }),
  };
});
