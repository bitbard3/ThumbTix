import { Redis } from "ioredis";

interface RedisConfig {
  host: string;
  port: number;
  password: string;
}

const defaultConfig: RedisConfig = {
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
  password: process.env.REDIS_PASSWORD || "test3839",
};

export function createRedisClient(config: RedisConfig = defaultConfig): Redis {
  try {
    const client = new Redis(
      `rediss://default:${config.password}@${config.host}:${config.port}`
    );
    return client;
  } catch (error) {
    console.error("Failed to create Redis client", error);
    throw error;
  }
}

class RedisManager {
  private static instance: Redis;

  private constructor() {}

  public static getInstance(): Redis {
    if (!RedisManager.instance) {
      RedisManager.instance = createRedisClient();
    }
    return RedisManager.instance;
  }

  public static async closeConnection(): Promise<void> {
    if (RedisManager.instance) {
      await RedisManager.instance.quit();
    }
  }
}

export default RedisManager;
