import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  SOCKET_PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
});

export const env = envSchema.parse({
  PORT: process.env.PORT,
  SOCKET_PORT: process.env.SOCKET_PORT,
  CORS_ORIGIN: process.env.CORS_ORIGIN,
});
