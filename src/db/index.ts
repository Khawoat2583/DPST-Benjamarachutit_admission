import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/server/env";
import * as schema from "./schema";

// Create the connection client
const queryClient = postgres(env.DATABASE_URL);

// Expose the Drizzle database helper
export const db = drizzle(queryClient, { schema });
