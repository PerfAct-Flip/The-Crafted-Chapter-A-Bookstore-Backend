import dotenv from "dotenv";
import path from "path";
import fs from "fs";

interface EnvConfig {
    port: number;
    databaseUrl: string;

    api: {
        version: string;
    };

    security: {
        bcryptRounds: number;
        jwtSecret: string;
        jwtRefreshSecret: string;
    };
}

function requireEnv(name: string, value?: string): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const env: EnvConfig = {
  port: parseInt(process.env.PORT || "8000", 10),

  databaseUrl: requireEnv("DATABASE_URL", process.env.DATABASE_URL),

  api: {
    version: process.env.API_VERSION || "v1",
  },

  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10),
    jwtSecret: requireEnv("JWT_SECRET", process.env.JWT_SECRET),
    jwtRefreshSecret: requireEnv("JWT_REFRESH_SECRET", process.env.JWT_REFRESH_SECRET),
  },
}

export default env;