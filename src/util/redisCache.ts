import redisClient from "./redisClient";

export const getOrSetCache = async (
  key: string,
  cb: () => Promise<string>,
  expirationInSeconds: number = 3600
): Promise<string> => {
  try {
    const cachedValue = await redisClient.get(key);
    if (cachedValue) {
      return cachedValue;
    }

    const freshValue = await cb();
    await redisClient.set(key, freshValue, "EX", expirationInSeconds);
    return freshValue;
  } catch (error) {
    console.error("Cache operation failed:", error);
    return cb(); // Fallback to callback if cache fails
  }
};
