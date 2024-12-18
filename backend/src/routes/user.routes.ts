import { Hono } from "hono";
import { getSignedDFileUrl } from "../utils/s3/getSignedFileUrl";
import { sign, verify } from "hono/jwt";
import prisma from "../../prisma/db";
import { authMiddleware } from "../middlewares/auth.middleware";
import { createTaskSchema, verifySiginSchema } from "../validations";
import { LAMPORTS_DECIMAL } from "../config/constants";
import nacl from "tweetnacl";
import bs58 from "bs58";
import { Connection } from "@solana/web3.js";
import type { JWTPayload } from "hono/utils/jwt/types";
const user = new Hono();

user.post("/signin", async (c) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT secret doesnt exist");
  }
  const body = await c.req.json();
  const parseData = verifySiginSchema.safeParse(body);

  if (!parseData.success) {
    return c.json({ msg: "Invalid Inputs" }, 411);
  }
  const verify = nacl.sign.detached.verify(
    new Uint8Array(Buffer.from(parseData.data.message, "utf-8")),
    new Uint8Array(Buffer.from(parseData.data.signature, "base64")),
    bs58.decode(parseData.data.publicKey)
  );
  if (!verify) {
    return c.json({ msg: "Invalid signature" }, 500);
  }
  let existingUser;
  try {
    existingUser = await prisma.user.findUnique({
      where: {
        address: parseData.data.publicKey,
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
          address: parseData.data.publicKey,
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
  const userId = c.user?.userId;
  if (!userId) {
    return c.json({ error: "User not found in context" }, 403);
  }
  let user;
  try {
    user = await prisma.user.findFirst({
      where: {
        id: Number(userId),
      },
    });
  } catch (error) {
    return c.json({ error: "User not found" }, 404);
  }
  if (!user?.address) {
    return c.json({ error: "You are not authorized" }, 403);
  }
  const body = await c.req.json();
  const parseData = createTaskSchema.safeParse(body);
  if (!parseData.success) {
    return c.json({ msg: "Invalid Inputs" }, 411);
  }

  try {
    const uniqueTaskRes = await prisma.task.findUnique({
      where: {
        paymentSignature: parseData.data.transactionSignature,
      },
    });
    if (uniqueTaskRes) {
      return c.json({ error: "Duplicate transaction" }, 409);
    }
  } catch (error) {
    return c.json({ error: "Internal server error" }, 500);
  }

  try {
    const connection = new Connection(process.env.RPC_URL || "");
    const signature = parseData.data.transactionSignature;

    if (!signature) {
      return c.json({ msg: "Signature is required" }, 400);
    }
    const getTransaction = async (retries = 3) => {
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          const transactionInfo = await connection.getTransaction(signature, {
            maxSupportedTransactionVersion: 1,
          });
          if (transactionInfo) {
            return transactionInfo;
          }
          await new Promise((resolve) => setTimeout(resolve, 2000 * attempt));
        } catch (error) {
          console.log(
            `Transaction retrieval attempt ${attempt} failed:`,
            error
          );
        }
      }

      throw new Error("Transaction not found after multiple attempts");
    };

    const transactionInfo = await getTransaction();

    if (!transactionInfo) {
      return c.json({ error: "Transaction not found" }, 404);
    }

    if (!transactionInfo.meta?.err == null) {
      return c.json({ error: "Transaction failed" }, 400);
    }

    const parentKey = transactionInfo.transaction.message
      .getAccountKeys()
      .get(1)
      ?.toString();
    const senderKey = transactionInfo.transaction.message
      .getAccountKeys()
      .get(0)
      ?.toString();

    if (!(parentKey === process.env.PARENT_PKEY && senderKey == user.address)) {
      return c.json(
        { error: "Transaction details do not match expected values" },
        400
      );
    }

    const preBalance = transactionInfo.meta?.preBalances[1];
    const postBalance = transactionInfo.meta?.postBalances[1];
    const networkFee = transactionInfo.meta?.fee;

    if (
      (preBalance ?? 0) - (postBalance ?? 0) - (networkFee ?? 0) ===
      parseData.data.amount
    ) {
      return c.json(
        { error: "Transaction details do not match expected values" },
        400
      );
    }

    const task = await prisma.$transaction(async (tx) => {
      const task = await tx.task.create({
        data: {
          title: parseData.data.title,
          amount: BigInt(parseData.data.amount * LAMPORTS_DECIMAL),
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
    console.log(error);
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
      select: {
        id: true,
        title: true,
        amount: true,
        done: true,
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
    return c.json(
      {
        tasks: tasks.map((task) => ({
          ...task,
          amount: task.amount.toString(),
        })),
      },
      200
    );
  } catch (error) {
    console.log(error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

user.get("/verify", async (c) => {
  const authToken = c.req.header("Authorization");
  if (!authToken) {
    return c.json({ msg: "You are not logged in" }, 403);
  }
  try {
    const decoded = (await verify(
      authToken,
      process.env.JWT_SECRET || ""
    )) as JWTPayload & { userId: string };
    if (decoded.userId) {
      return c.json({ msg: "You are logged in" }, 200);
    }
  } catch (error) {
    return c.json({ msg: "You are not logged in" }, 403);
  }
});

export default user;
