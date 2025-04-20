import { zValidator } from "@hono/zod-validator";
import bcrypt from "bcrypt";
import { HTTPException } from "hono/http-exception";
import { createModule } from "serverstruct";
import { z } from "zod";
import { database } from "../db/db";
import { JwtService } from "../services/jwt";
import { Middlewares } from "../services/middlewares";

export const auth = createModule()
  .use<{ jwt: JwtService; middlewares: Middlewares }>()
  .route((app, { jwt, middlewares }) => {
    return app
      .post("/signup", zValidator("json", authSchemas.signup), async (c) => {
        // parse req body
        const body = c.req.valid("json");

        // hash password
        const hashedPassword = await bcrypt.hash(body.password, 10);

        // create user
        const user = await database.collections.users
          .insertOne({
            username: body.username,
            hashedPassword,
          })
          .catch((err) => {
            if (err.code === 11000) {
              throw new HTTPException(409, {
                message: "Username already taken",
              });
            }
            throw err;
          });

        // create jwt
        const token = jwt.sign({ sub: user._id.toString() });

        // return jwt
        return c.json({
          message: "User created",
          token,
        });
      })
      .post("/signin", zValidator("json", authSchemas.signin), async (c) => {
        // parse req body
        const body = c.req.valid("json");

        // find user
        const user = await database.collections.users
          .findOne({
            username: body.username,
          })
          .select({
            hashedPassword: true,
          });
        if (!user) {
          throw new HTTPException(400, {
            message: "Username or password incorrect",
          });
        }

        // verify password
        const verified = await bcrypt.compare(
          body.password,
          user.hashedPassword
        );
        if (!verified) {
          throw new HTTPException(400, {
            message: "Username or password incorrect",
          });
        }

        // create jwt
        const token = jwt.sign({ sub: user._id.toString() });

        // return jwt
        return c.json({
          message: "Signin successful",
          token,
        });
      })
      .get("/me", middlewares.auth(), async (c) => {
        const userId = c.get("userId");

        // get user
        const user = await database.collections.users.findById(userId);

        return c.json(user);
      });
  });

const authSchemas = {
  signup: z.object({
    username: z.string(),
    password: z.string().min(8),
  }),

  signin: z.object({
    username: z.string(),
    password: z.string(),
  }),
};
