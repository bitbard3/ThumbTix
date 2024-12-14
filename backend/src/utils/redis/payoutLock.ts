import { Redis } from "ioredis";

export async function acquireLock(
  client: Redis,
  key: string,
  timeout: number = 30
): Promise<boolean> {
  try {
    const result = await client.set(key, "locked", "EX", timeout, "NX");
    return result === "OK";
  } catch (error) {
    console.error("Error acquiring lock", error);
    return false;
  }
}

export async function releaseLock(client: Redis, key: string): Promise<void> {
  try {
    await client.del(key);
  } catch (error) {
    console.error("Error releasing lock", error);
  }
}

export async function withLock<T>(
  client: Redis,
  lockKey: string,
  operation: () => Promise<T>,
  lockTimeout: number = 30
): Promise<T | null> {
  try {
    if (client.status !== "ready") {
      console.error("Redis client not ready");
      return null;
    }
    const lockAcquired = await acquireLock(client, lockKey, lockTimeout);
    if (!lockAcquired) {
      return null;
    }

    try {
      return await operation();
    } finally {
      await releaseLock(client, lockKey);
    }
  } catch (error) {
    return null;
  }
}
