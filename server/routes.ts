import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Получение всех задач
  app.get(api.todos.list.path, async (req, res) => {
    const todosList = await storage.getTodos();
    res.json(todosList);
  });

  // Создание новой задачи
  app.post(api.todos.create.path, async (req, res) => {
    try {
      const input = api.todos.create.input.parse(req.body);
      const todo = await storage.createTodo(input);
      res.status(201).json(todo);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Внутренняя ошибка сервера" });
    }
  });

  // Обновление задачи (изменение текста или статуса)
  app.patch(api.todos.update.path, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Неверный ID" });
      }

      const input = api.todos.update.input.parse(req.body);
      const updated = await storage.updateTodo(id, input);
      
      if (!updated) {
        return res.status(404).json({ message: "Задача не найдена" });
      }
      
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Внутренняя ошибка сервера" });
    }
  });

  // Удаление задачи
  app.delete(api.todos.delete.path, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Неверный ID" });
    }

    const deleted = await storage.deleteTodo(id);
    if (!deleted) {
      return res.status(404).json({ message: "Задача не найдена" });
    }

    res.status(204).send();
  });

  return httpServer;
}
