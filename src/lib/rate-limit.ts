import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Noop rate limiter — always allows the request
const noopLimiter = {
  limit: async () => ({ success: true, limit: 0, remaining: 999, reset: 0 }),
};

function createLimiters() {
  const url = process.env.UPSTASH_REDIS_URL;
  const token = process.env.UPSTASH_REDIS_TOKEN;

  if (!url || !token) {
    console.warn(
      "[ColdOpener] Upstash Redis not configured — rate limiting disabled. " +
        "Set UPSTASH_REDIS_URL and UPSTASH_REDIS_TOKEN to enable.",
    );
    return {
      authRateLimit: noopLimiter,
      generateRateLimit: noopLimiter,
      generateDailyLimit: noopLimiter,
    };
  }

  const redis = new Redis({ url, token });

  return {
    authRateLimit: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 m"),
      analytics: true,
      prefix: "ratelimit:auth",
    }),
    generateRateLimit: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, "1 m"),
      analytics: true,
      prefix: "ratelimit:generate",
    }),
    generateDailyLimit: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(50, "1 d"),
      analytics: true,
      prefix: "ratelimit:generate:daily",
    }),
  };
}

export const { authRateLimit, generateRateLimit, generateDailyLimit } =
  createLimiters();
