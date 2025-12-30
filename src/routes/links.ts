import bcrypt from "bcrypt";
import { HTTPError, readValidatedBody } from "h3";
import { toObjectId } from "monarch-orm";
import { controller } from "serverstruct";
import { z } from "zod";
import { database } from "../db/index.ts";
import { authContext, authMiddleware } from "../middlewares/auth.ts";

export const links = controller((app, box) => {
  const db = box.get(database);

  app.use(box.get(authMiddleware));

  app.get("/", async (event) => {
    const { userId } = authContext.get(event);

    const links = await db.collections.links.find({ userId });

    return links;
  });

  app.post("/", async (event) => {
    const { userId } = authContext.get(event);

    // parse req body
    const { password, ...data } = await readValidatedBody(
      event,
      LinksSchema.create
    );

    // hash password if provided
    const hashedPassword = password
      ? await bcrypt.hash(password, 10)
      : undefined;

    const link = await db.collections.links
      .insertOne({
        ...data,
        userId,
        hashedPassword,
      })
      .catch((err) => {
        if (err.code === 11000) {
          throw new HTTPError(`Link with name '${data.name}' already exists`, {
            status: 409,
          });
        }
        throw err;
      });

    return link;
  });

  app.get("/:id", async (event) => {
    const { userId } = authContext.get(event);

    // get id from params
    const id = toObjectId(event.context.params?.id!);
    if (!id) {
      throw new HTTPError("Link not found", { status: 404 });
    }

    const link = await db.collections.links.findOne({
      userId: userId,
      _id: id,
    });
    if (!link) {
      throw new HTTPError("Link not found", { status: 404 });
    }

    return link;
  });

  app.put("/:id", async (event) => {
    const { userId } = authContext.get(event);

    // parse req body
    const { password, ...data } = await readValidatedBody(
      event,
      LinksSchema.update
    );
    // get id from params
    const id = toObjectId(event.context.params?.id!);
    if (!id) {
      throw new HTTPError("Link not found", { status: 404 });
    }

    // hash password if provided
    const hashedPassword = password
      ? await bcrypt.hash(password, 10)
      : undefined;

    // update link
    const updateLink = await db.collections.links
      .findOneAndUpdate(
        {
          userId: userId,
          _id: id,
        },
        {
          $set: {
            ...data,
            hashedPassword,
          },
        }
      )
      .options({
        returnDocument: "after",
      });
    if (!updateLink) {
      throw new HTTPError("Link not found", { status: 404 });
    }

    return updateLink;
  });

  app.delete("/:id", async (event) => {
    const { userId } = authContext.get(event);

    // get id from params
    const id = toObjectId(event.context.params?.id!);
    if (!id) {
      throw new HTTPError("Link not found", { status: 404 });
    }

    // delete link
    const deleteResult = await db.collections.links.deleteOne({
      userId,
      _id: id,
    });
    if (!deleteResult.deletedCount) {
      throw new HTTPError("Link not found", { status: 404 });
    }

    return null;
  });
});

class LinksSchema {
  static create = z.object({
    name: z.string(),
    url: z.string().url(),
    password: z.string().optional(),
  });

  static update = this.create;
}
