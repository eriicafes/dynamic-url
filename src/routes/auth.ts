import { zValidator } from "@hono/zod-validator";
import { createModule } from "serverstruct";
import { z } from "zod";

export const auth = createModule().route((app) => {
  return app
    .post("/signup", zValidator("json", authSchemas.signup), (c) => {
      const body = c.req.valid("json");
      // parse req body
      // create user
      // create jwt
      // return jwt
      return c.json(body);
    })
    .post("/signin", zValidator("json", authSchemas.signup), (c) => {
      const body = c.req.valid("json");
      // parse req body
      // find user
      // create jwt
      // return jwt
      return c.json(body);
    });
});

const authSchemas = {
  signup: z.object({
    username: z.string(),
    password: z.string(),
  }),

  signin: z.object({
    username: z.string(),
    password: z.string(),
  }),
};
