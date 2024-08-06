import Redis from "ioredis";

// import { createClient } from "redis";
// const redisClient = new Redis({
//   password: "v54RlRSZc9psJfh8mck3fHexvRtOPWAz",
//   socket: {
//     host: "redis-17273.c14.us-east-1-3.ec2.redns.redis-cloud.com",
//     port: 17273,
//   },
// });

const redisClient = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || "6379"),
  password: process.env.REDIS_PASSWORD,
});

redisClient.on("error", (err) => console.log("Redis Client Error", err));
redisClient.on("connect", () => console.log("Connected to Redis"));

export default redisClient;
