import { z } from "zod";

const schema=z.object({
  DATABASE_URL:z.string().url().startsWith("postgresql://"),
  AUTH_SECRET:z.string().min(32),
  APP_URL:z.string().url(),
  S3_ENDPOINT:z.string().url(),
  S3_REGION:z.string().min(1),
  S3_BUCKET:z.string().min(1),
  S3_ACCESS_KEY_ID:z.string().min(1),
  S3_SECRET_ACCESS_KEY:z.string().min(1),
});
export type Environment=z.infer<typeof schema>;
export const parseEnvironment=(input:NodeJS.ProcessEnv):Environment=>schema.parse(input);
