import {
  pgTable,
  serial,
  text,
  timestamp,
  boolean,
  index,
} from "drizzle-orm/pg-core";

export const todos = pgTable(
  "todos",
  {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    completed: boolean("completed").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [index("completed_idx").on(table.completed)],
);
