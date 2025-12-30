import bcrypt from "bcrypt";
import { HTTPError, readValidatedBody } from "h3";
import { controller } from "serverstruct";
import { z } from "zod";
import { database } from "../db/index.ts";
import { authContext, authMiddleware } from "../middlewares/auth.ts";
import { JwtService } from "../services/jwt.ts";

export const auth = controller((app, box) => {
  const db = box.get(database);
  const jwt = box.get(JwtService);

  app.get(
    "/me",
    async (event) => {
      const { userId } = authContext.get(event);

      // get user
      const user = await db.collections.users.findById(userId);

      return user;
    },
    { middleware: [box.get(authMiddleware)] }
  );

  app.post("/signup", async (event) => {
    // parse req body
    const body = await readValidatedBody(event, AuthSchema.signup);

    // hash password
    const hashedPassword = await bcrypt.hash(body.password, 10);

    // create user
    const user = await db.collections.users
      .insertOne({
        username: body.username,
        hashedPassword,
      })
      .catch((err) => {
        if (err.code === 11000) {
          throw new HTTPError("Username already taken", { status: 409 });
        }
        throw err;
      });

    // create jwt
    const token = jwt.sign({ sub: user._id.toString() });

    // return jwt
    return {
      message: "User created",
      token,
    };
  });

  app.post("/signin", async (event): Promise<any> => {
    // parse req body
    const body = await readValidatedBody(event, AuthSchema.signin);

    // find user
    const user = await db.collections.users
      .findOne({
        username: body.username,
      })
      .select({
        hashedPassword: true,
      });
    console.log(user, body);
    if (!user) {
      throw new HTTPError("Incorrect username or password", { status: 400 });
    }

    // verify password
    const verified = await bcrypt.compare(body.password, user.hashedPassword);
    if (!verified) {
      throw new HTTPError("Incorrect username or password", { status: 400 });
    }

    // create jwt
    const token = jwt.sign({ sub: user._id.toString() });

    // return jwt
    return {
      message: "Signin successful",
      token,
    };
  });
});

class AuthSchema {
  static signup = z.object({
    username: z.string().toLowerCase(),
    password: z.string().min(8),
  });

  static signin = z.object({
    username: z.string().toLowerCase(),
    password: z.string(),
  });
}
