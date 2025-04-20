import { Hono } from "hono";

export const app = new Hono();

app.get("/ping", (c) => {
  return c.text("pong");
});
