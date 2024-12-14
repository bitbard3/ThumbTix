import { Hono } from "hono";
import { sign } from "hono/jwt";
import prisma from "../../prisma/db";
import { authMiddleware } from "../middlewares/auth.middleware";
import { nextTaskService } from "../services/nextTaskService";
import {
  createSubmissionSchema,
  payoutSchema,
  verifySiginSchema,
} from "../validations";
import { LAMPORTS_DECIMAL, TOTAL_WORKER } from "../config/constants";
import nacl from "tweetnacl";
import bs58 from "bs58";
import RedisManager from "../utils/redis/config";
import { withLock } from "../utils/redis/payoutLock";
import {
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";

const worker = new Hono();
const redis = RedisManager.getInstance();
const connection = new Connection(process.env.RPC_URL ?? "");

worker.post("/signin", async (c) => {
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
    existingUser = await prisma.worker.findUnique({
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
      const user = await prisma.$transaction(async (tx) => {
        const balance = await tx.balance.create({
          data: {
            lockedAmount: BigInt("0"),
            pendingAmount: BigInt("0"),
          },
        });
        const user = await tx.worker.create({
          data: {
            address: parseData.data.publicKey,
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
    return c.json(
      {
        balance: {
          pendingAmount: balance?.balance.pendingAmount.toString(),
          lockedAmount: balance?.balance.lockedAmount.toString(),
        },
      },
      200
    );
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
    const task = await nextTaskService(userId);
    if (!task.id) {
      return c.json({ msg: "You dont have any more task" }, 411);
    } else {
      return c.json({ task }, 200);
    }
  } catch (error) {
    console.log(error);
    return c.json({ msg: "Something went wrong" }, 500);
  }
});

worker.post("/submission", authMiddleware, async (c) => {
  const userId = c.user?.userId;
  if (!userId) {
    return c.json({ error: "User not found in context" }, 403);
  }
  const body = await c.req.json();
  const parseData = createSubmissionSchema.safeParse(body);
  if (parseData.success) {
    const task = await nextTaskService(userId);
    const options: number[] = [];
    task.options?.map((option) => options.push(option.id));
    if (
      !task ||
      task.id !== parseData.data.taskId ||
      !options.includes(parseData.data.optionId)
    ) {
      return c.json({ msg: "Invalid task or invalid option" }, 411);
    }
    if (!task.amount) {
      console.log(task);
      return c.json({ msg: "Something went wrong" }, 500);
    }
    const amount = BigInt(task.amount) / BigInt(TOTAL_WORKER);
    try {
      const submission = await prisma.$transaction(async (tx) => {
        const submission = await tx.submission.create({
          data: {
            taskId: parseData.data.taskId,
            optionId: parseData.data.optionId,
            workerId: Number(userId),
            amount,
          },
        });
        await tx.worker.update({
          where: {
            id: Number(userId),
          },
          data: {
            balance: {
              update: {
                pendingAmount: {
                  increment: amount,
                },
              },
            },
          },
        });
        return submission;
      });
      const nextTask = await nextTaskService(userId);
      return c.json(
        {
          task: nextTask,
          submission: { ...submission, amount: amount.toString() },
        },
        200
      );
    } catch (error) {
      console.log(error);
      return c.json({ msg: "Something went wrong" }, 500);
    }
  }
});

worker.put("/payout", authMiddleware, async (c) => {
  const userId = c.user?.userId;
  if (!userId) {
    return c.json({ error: "User not found in context" }, 403);
  }
  const body = await c.req.json();
  const parseData = payoutSchema.safeParse(body);
  if (!parseData.success) {
    return c.json({ msg: "Invalid Inputs" }, 411);
  }

  const lockKey = `payout:worker:${userId}:${crypto.randomUUID()}`;
  let balanceRes: { pendingAmount: number; lockedAmount: number } | null = null;
  try {
    const result = await withLock(redis, lockKey, async () => {
      const worker = await prisma.worker.findUnique({
        where: { id: Number(userId) },
        select: {
          id: true,
          address: true,
          balance: {
            select: {
              pendingAmount: true,
            },
          },
        },
      });

      if (!worker) {
        throw new Error("Worker not found");
      }

      if (
        parseData.data.amount >
        Number(worker.balance.pendingAmount) / LAMPORTS_DECIMAL
      ) {
        throw new Error("Insufficient balance");
      }

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(process.env.PARENT_PKEY || ""),
          toPubkey: new PublicKey(worker.address),
          lamports: parseData.data.amount * LAMPORTS_DECIMAL,
        })
      );

      const keypair = Keypair.fromSecretKey(
        bs58.decode(process.env.WALLET_KEY || "")
      );

      let signature = "";
      try {
        signature = await sendAndConfirmTransaction(connection, transaction, [
          keypair,
        ]);
      } catch (e) {
        throw new Error("Transaction Failed");
      }

      await prisma.$transaction(
        async (tx) => {
          const res = await tx.worker.update({
            where: {
              id: worker.id,
              balance: {
                pendingAmount: worker.balance.pendingAmount,
              },
            },
            data: {
              balance: {
                update: {
                  pendingAmount: {
                    decrement: BigInt(parseData.data.amount * LAMPORTS_DECIMAL),
                  },
                  lockedAmount: {
                    increment: BigInt(parseData.data.amount * LAMPORTS_DECIMAL),
                  },
                },
              },
            },
            select: {
              balance: {
                select: {
                  pendingAmount: true,
                  lockedAmount: true,
                },
              },
            },
          });
          balanceRes = {
            pendingAmount: Number(res.balance.pendingAmount) / LAMPORTS_DECIMAL,
            lockedAmount: Number(res.balance.lockedAmount) / LAMPORTS_DECIMAL,
          };
          await tx.payouts.create({
            data: {
              workerId: worker.id,
              amount: BigInt(parseData.data.amount * LAMPORTS_DECIMAL),
              status: "Success",
              signature: signature,
            },
          });

          return { signature };
        },
        {
          maxWait: 5000,
          timeout: 10000,
        }
      );

      return { signature };
    });

    if (result) {
      return c.json(
        {
          message: "Payout processed successfully",
          signature: result.signature,
          balance: balanceRes,
        },
        200
      );
    } else {
      return c.json({ msg: "Payout failed" }, 500);
    }
  } catch (error) {
    console.error("Payout error:", error);
    return c.json(
      { msg: error instanceof Error ? error.message : "Something went wrong" },
      500
    );
  }
});

export default worker;
