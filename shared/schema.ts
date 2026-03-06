import { pgTable, text, serial, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Таблица задач (используем Drizzle ORM для описания структуры, хотя хранить будем в памяти)
export const todos = pgTable("todos", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  completed: boolean("completed").default(false).notNull(),
  createdAt: text("created_at").notNull(),
});

// Схема для добавления новой задачи (включает валидацию)
export const insertTodoSchema = createInsertSchema(todos, {
  title: z
    .string()
    .min(1, "Текст задачи не может быть пустым. Пожалуйста, напиши что-нибудь!")
    .max(200, "Текст задачи слишком длинный, постарайся уложиться в 200 символов."),
}).pick({
  title: true,
});

// Схема для обновления задачи (можно обновить либо текст, либо статус)
export const updateTodoSchema = z.object({
  title: z
    .string()
    .min(1, "Текст задачи не может быть пустым.")
    .max(200, "Текст задачи слишком длинный.")
    .optional(),
  completed: z.boolean().optional(),
});

export type InsertTodo = z.infer<typeof insertTodoSchema>;
export type UpdateTodo = z.infer<typeof updateTodoSchema>;
export type Todo = typeof todos.$inferSelect;
