import { Hono } from "hono";
import { getSignedDFileUrl } from "../utils/s3/getSignedFileUrl";
import { sign } from "hono/jwt";
import prisma from "../../prisma/db";
import { authMiddleware } from "../middlewares/auth.middleware";

const user = new Hono();

user.post("/signin", async (c) => {
  // TODO: add sign verification logic here
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT secret doesnt exist");
  }
  const hardCodedAddress = "CcrCWF9bh4D4NrdSyEtCsWfoc5oMgHvCAjYMAUAkmHmt";
  let existingUser;
  try {
    existingUser = await prisma.user.findUnique({
      where: {
        address: hardCodedAddress,
      },
    });
  } catch (error) {
    return c.json({ msg: "Something went wrong" }, 500);
  }
  if (existingUser) {
    const token = await sign(
      { userId: existingUser.id },
      process.env.JWT_SECRET
    );
    return c.json({ token });
  } else {
    try {
      const user = await prisma.user.create({
        data: {
          address: hardCodedAddress,
        },
      });
      const token = await sign({ userId: user.id }, process.env.JWT_SECRET);
      return c.json({ token });
    } catch (error) {
      return c.json({ msg: "Something went wrong" }, 500);
    }
  }
});

user.get("/signedurl", authMiddleware, async (c) => {
  const userId = c.user?.userId;
  if (!userId) {
    return c.json({ error: "User not found in context" }, 403);
  }
  try {
    const fileType = c.req.query("filetype") || "jpg";
    const url = await getSignedDFileUrl({
      fileName: `${userId}/${Math.random()}/${Date.now()}.${fileType}`,
      expiresIn: 60 * 10,
    });
    return c.json({ url }, 200);
  } catch (error) {
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default user;
