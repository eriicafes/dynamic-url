import { createSchema } from "monarch-orm";
import { number, objectId, string } from "monarch-orm/types";

export const links = createSchema("links", {
  url: string(),
  name: string(),
  userId: objectId(),
  hashedPassword: string().optional(),
  views: number().default(0),
  // TODO: extra fields
}).indexes(({ createIndex }) => {
  return {
    userLinkName: createIndex({ userId: 1, name: 1 }, { unique: true }),
  };
});
