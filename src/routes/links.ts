import { zValidator } from "@hono/zod-validator";
import { HTTPException } from "hono/http-exception";
import { toObjectId } from "monarch-orm";
import { createModule } from "serverstruct";
import z from "zod";
import { database } from "../db/db";
import { JwtService } from "../services/jwt";
import { Middlewares } from "../services/middlewares";

export const links = createModule()
  .use<{ jwt: JwtService; middlewares: Middlewares }>()
  .route((app, { middlewares }) => {
    return app
      .use(middlewares.auth())
      .get("/", async (c) => {
        const userId = c.get("userId");

        const links = await database.collections.links.find({ userId });

        return c.json(links);
      })
      .post("/", zValidator("json", linksSchemas.create), async (c) => {
        const userId = c.get("userId");

        // parse req body
        const body = c.req.valid("json");

        const link = await database.collections.links
          .insertOne({
            userId: userId,
            name: body.name,
            url: body.url,
          })
          .catch((err) => {
            if (err.code === 11000) {
              throw new HTTPException(409, {
                message: `Link with name '${body.name}' already exists`,
              });
            }
            throw err;
          });

        return c.json(link, 201);
      })
      .get("/:id", async (c) => {
        const userId = c.get("userId");

        // get id from params
        const id = toObjectId(c.req.param("id"));
        if (!id) {
          throw new HTTPException(404, {
            message: "Link not found",
          });
        }

        const link = await database.collections.links.findOne({
          userId: userId,
          _id: id,
        });
        if (!link) {
          throw new HTTPException(404, {
            message: "Link not found",
          });
        }

        return c.json(link);
      })
      .put("/:id", zValidator("json", linksSchemas.update), async (c) => {
        const userId = c.get("userId");

        // parse req body
        const body = c.req.valid("json");
        // get id from params
        const id = toObjectId(c.req.param("id"));
        if (!id) {
          throw new HTTPException(404, {
            message: "Link not found",
          });
        }

        // update link
        const updateResult = await database.collections.links.updateOne(
          {
            userId: userId,
            _id: id,
          },
          {
            $set: {
              name: body.name,
              url: body.url,
            },
          }
        );
        if (!updateResult.modifiedCount) {
          throw new HTTPException(404, {
            message: "Link not found",
          });
        }

        // get updated link
        const link = await database.collections.links.findOne({
          userId: userId,
          _id: id,
        });
        if (!link) {
          throw new HTTPException(404, {
            message: "Link not found",
          });
        }

        return c.json(link);
      })
      .delete("/:id", async (c) => {
        const userId = c.get("userId");

        // get id from params
        const id = toObjectId(c.req.param("id"));
        if (!id) {
          throw new HTTPException(404, {
            message: "Link not found",
          });
        }

        // delete link
        const deleteResult = await database.collections.links.deleteOne({
          userId,
          _id: id,
        });
        if (!deleteResult.deletedCount) {
          throw new HTTPException(404, {
            message: "Link not found",
          });
        }

        return c.body(null, 200);
      });
  });

const linksSchemas = {
  create: z.object({
    name: z.string(),
    url: z.string().url(),
  }),

  update: z.object({
    name: z.string(),
    url: z.string().url(),
  }),
};
