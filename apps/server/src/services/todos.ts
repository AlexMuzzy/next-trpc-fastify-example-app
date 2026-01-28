import { DrizzleClient } from "@fsapp/server/db/database.js";
import { todos } from "@fsapp/server/db/todo-schema.js";
import { eq } from "drizzle-orm";

export const listTodos = async (db: DrizzleClient) =>
  await db.select().from(todos);

export const createTodo = async (db: DrizzleClient, title: string) => {
  const [todo] = await db
    .insert(todos)
    .values({ title, completed: false })
    .returning({
      id: todos.id,
      title: todos.title,
      completed: todos.completed,
    });
  return todo;
};

export const updateTodo = async (
  db: DrizzleClient,
  id: number,
  title: string,
  completed: boolean,
) => {
  const [todo] = await db
    .update(todos)
    .set({ title, completed })
    .where(eq(todos.id, id))
    .returning({
      id: todos.id,
      title: todos.title,
      completed: todos.completed,
    });
  return todo;
};

export const deleteTodo = async (db: DrizzleClient, id: number) => {
  const [todo] = await db.delete(todos).where(eq(todos.id, id)).returning({
    id: todos.id,
    title: todos.title,
    completed: todos.completed,
  });
  return todo;
};
