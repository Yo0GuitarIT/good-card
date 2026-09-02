import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "../env";
import * as schema from "./schema";

const queryClient = postgres(env.databaseUrl);

export const db = drizzle(queryClient, { schema });
export { schema };
