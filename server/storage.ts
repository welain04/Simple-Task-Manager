import { todos, type Todo, type InsertTodo, type UpdateTodo } from "@shared/schema";

export interface IStorage {
  getTodos(): Promise<Todo[]>;
  getTodo(id: number): Promise<Todo | undefined>;
  createTodo(todo: InsertTodo): Promise<Todo>;
  updateTodo(id: number, updates: UpdateTodo): Promise<Todo | undefined>;
  deleteTodo(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private todos: Map<number, Todo>;
  private currentId: number;

  constructor() {
    this.todos = new Map();
    this.currentId = 1;
  }

  async getTodos(): Promise<Todo[]> {
    return Array.from(this.todos.values());
  }

  async getTodo(id: number): Promise<Todo | undefined> {
    return this.todos.get(id);
  }

  async createTodo(insertTodo: InsertTodo): Promise<Todo> {
    const id = this.currentId++;
    const todo: Todo = { ...insertTodo, id, completed: false };
    this.todos.set(id, todo);
    return todo;
  }

  async updateTodo(id: number, updates: UpdateTodo): Promise<Todo | undefined> {
    const existing = this.todos.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.todos.set(id, updated);
    return updated;
  }

  async deleteTodo(id: number): Promise<boolean> {
    return this.todos.delete(id);
  }
}

export const storage = new MemStorage();

// Добавим немного начальных данных для красоты
async function seedData() {
  await storage.createTodo({ title: "Купить молоко" });
  const t2 = await storage.createTodo({ title: "Написать To-Do лист" });
  await storage.updateTodo(t2.id, { completed: true });
}

seedData().catch(console.error);
