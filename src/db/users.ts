import { createSchema } from "monarch-orm";
import { string } from "monarch-orm/types";

export const users = createSchema("users", {
  username: string(),
  hashedPassword: string(),
})
  .omit({
    hashedPassword: true,
  })
  .indexes(({ unique }) => {
    return {
      username: unique("username"),
    };
  });
