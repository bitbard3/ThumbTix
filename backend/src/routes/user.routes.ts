import { Hono } from "hono";
import { getSignedDFileUrl } from "../utils/s3/getSignedFileUrl";
import { sign } from "hono/jwt";
import prisma from "../../prisma/db";
import { authMiddleware } from "../middlewares/auth.middleware";
import { createTaskSchema } from "../validations";
import { LAMPORTS_DECIMAL } from "../config/constants";

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
    const fileName = `${userId}/${Math.random()}/${Date.now()}.${fileType}`;
    const url = await getSignedDFileUrl({
      fileName,
      expiresIn: 60 * 10,
    });
    return c.json({ url, fileName }, 200);
  } catch (error) {
    return c.json({ error: "Internal server error" }, 500);
  }
});

user.post("/task", authMiddleware, async (c) => {
  // TODO:Verify transaction signataure and extract amount from the signataure

  const userId = c.user?.userId;
  if (!userId) {
    return c.json({ error: "User not found in context" }, 403);
  }
  const body = await c.req.json();
  const parseData = createTaskSchema.safeParse(body);
  if (!parseData.success) {
    return c.json({ msg: "Invalid Inputs" }, 411);
  }
  try {
    const task = await prisma.$transaction(async (tx) => {
      const task = await tx.task.create({
        data: {
          title: parseData.data.title,
          amount: BigInt("1") * LAMPORTS_DECIMAL,
          paymentSignature: parseData.data.transactionSignature,
          userId: Number(userId),
        },
      });
      await tx.option.createMany({
        data: parseData.data.options.map((option) => ({
          imageUrl: option.imageUrl,
          taskId: task.id,
        })),
      });
      return task;
    });
    return c.json({ id: task.id }, 200);
  } catch (error) {
    return c.json({ error: "Internal server error" }, 500);
  }
});

user.get("/task", authMiddleware, async (c) => {
  const userId = c.user?.userId;
  if (!userId) {
    return c.json({ error: "User not found in context" }, 403);
  }
  try {
    const tasks = await prisma.task.findMany({
      where: {
        userId: Number(userId),
      },
      include: {
        options: {
          include: {
            _count: {
              select: {
                submissions: true,
              },
            },
          },
        },
      },
    });
    return c.json({ tasks }, 200);
  } catch (error) {
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default user;
