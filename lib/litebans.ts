import { PrismaClient } from "@prisma/litebans-client";

const globalForLiteBans = global as unknown as { litebans: PrismaClient };

export const litebans =
  globalForLiteBans.litebans ||
  new PrismaClient({
    log: ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForLiteBans.litebans = litebans;
