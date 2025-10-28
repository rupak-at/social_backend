import redis from "redis";

const redisClient = redis.createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redisClient.on("error", (err) => {
  console.error("❌ Redis connection error:", err);
});

redisClient.on("ready", () => {
  console.log("✅ Redis connected successfully");
});

await redisClient.connect();

export default redisClient;
