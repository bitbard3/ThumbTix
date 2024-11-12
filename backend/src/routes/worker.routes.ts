import { Hono } from "hono";
import { sign } from "hono/jwt";
import prisma from "../../prisma/db";
import { authMiddleware } from "../middlewares/auth.middleware";

const worker = new Hono();

worker.post("/signin", async (c) => {
  // TODO: add sign verification logic here
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT secret doesnt exist");
  }
  const hardCodedAddress = "CcrCWF9bh4D4NrdSyEtCsWfoc5oMgHvCAjYMAUAkmHmt";
  let existingUser;
  try {
    existingUser = await prisma.worker.findUnique({
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
      const user = await prisma.$transaction(async (tx) => {
        const balance = await tx.balance.create({
          data: {
            lockedAmount: BigInt("0"),
            pendingAmount: BigInt("0"),
          },
        });
        const user = await tx.worker.create({
          data: {
            address: hardCodedAddress,
            balanceId: balance.id,
          },
        });
        return user;
      });

      const token = await sign({ userId: user.id }, process.env.JWT_SECRET);
      return c.json({ token });
    } catch (error) {
      return c.json({ msg: "Something went wrong" }, 500);
    }
  }
});

worker.get("/balance", authMiddleware, async (c) => {
  const userId = c.user?.userId;
  if (!userId) {
    return c.json({ error: "User not found in context" }, 403);
  }
  try {
    const balance = await prisma.worker.findUnique({
      where: {
        id: Number(userId),
      },
      include: {
        balance: true,
      },
    });
    return c.json({ balance: balance?.balance }, 200);
  } catch (error) {
    return c.json({ msg: "Something went wrong" }, 500);
  }
});

worker.get("/nexttask", authMiddleware, async (c) => {
  const userId = c.user?.userId;
  if (!userId) {
    return c.json({ error: "User not found in context" }, 403);
  }
  try {
    const task = await prisma.task.findFirst({
      where: {
        done: false,
        submissions: {
          none: {
            workerId: Number(userId),
          },
        },
      },
      select: {
        title: true,
        options: true,
      },
    });
    if (!task) {
      return c.json({ msg: "You dont have any more task" }, 411);
    } else {
      return c.json({ task }, 200);
    }
  } catch (error) {
    return c.json({ msg: "Something went wrong" }, 500);
  }
});


export default worker;
