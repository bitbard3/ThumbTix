import { createMiddleware } from "hono/factory";
import { verify } from "hono/jwt";
import type { JWTPayload } from "hono/utils/jwt/types";

interface UserData {
    userId: string;
  }
  
  declare module "hono" {
    interface Context {
      user?: UserData;
    }
  }
  

export const authMiddleware = createMiddleware(async (c, next) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT secret doesnt exist");
  }
  const authToken = c.req.header("Authorization");
  if (!authToken) {
    return c.json({ msg: "You are not logged in" }, 403);
  }
  try {
    const decoded = await verify(authToken, process.env.JWT_SECRET) as JWTPayload & { userId: string };
    if (decoded.userId) {
        c.user = { userId: decoded.userId };
      return await next();
    }
  } catch (error) {
    return c.json({ msg: "You are not logged in" }, 403);
  }
});
