import {
  session,
  user,
  account,
  verification,
} from "@fsapp/server/db/auth-schema.js";
import { todos } from "@fsapp/server/db/todo-schema.js";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";

const todoSchema = {
  todos,
};

export const authSchema = {
  session,
  user,
  account,
  verification,
};

export const schema = {
  ...todoSchema,
  ...authSchema,
};

export type DrizzleClient = PostgresJsDatabase<typeof schema>;
