import Redis from "ioredis";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

let redis;

if (redisUrl && redisToken) {
  redis = new Redis(redisUrl, { password: redisToken });
} else if (redisUrl) {
  redis = new Redis(redisUrl);
} else {
  throw new Error("No Redis URL found in environment variables.");
}

export { redis };