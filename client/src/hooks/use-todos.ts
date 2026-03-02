import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type { InsertTodo, UpdateTodo } from "@shared/schema";
import { z } from "zod";

/**
 * Хук для получения списка всех задач.
 * React Query автоматически кеширует данные и обновляет их при необходимости.
 */
export function useTodos() {
  return useQuery({
    // Используем путь как ключ для кеша
    queryKey: [api.todos.list.path],
    queryFn: async () => {
      const res = await fetch(api.todos.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Не удалось загрузить задачи");
      
      // Парсим ответ через Zod схему для обеспечения типобезопасности
      const data = await res.json();
      return api.todos.list.responses[200].parse(data);
    },
  });
}

/**
 * Хук для создания новой задачи.
 */
export function useCreateTodo() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newTodo: InsertTodo) => {
      // Валидируем данные перед отправкой
      const validated = api.todos.create.input.parse(newTodo);
      
      const res = await fetch(api.todos.create.path, {
        method: api.todos.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = await res.json();
          throw new Error(error.message || "Ошибка валидации");
        }
        throw new Error("Не удалось создать задачу");
      }
      
      return api.todos.create.responses[201].parse(await res.json());
    },
    // После успешного создания инвалидируем кеш, чтобы список обновился
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.todos.list.path] });
    },
  });
}

/**
 * Хук для обновления задачи (изменение текста или статуса выполнено/нет).
 */
export function useUpdateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: UpdateTodo }) => {
      // Валидируем изменения
      const validated = api.todos.update.input.parse(updates);
      
      // Генерируем правильный URL с ID задачи (например: /api/todos/1)
      const url = buildUrl(api.todos.update.path, { id });
      
      const res = await fetch(url, {
        method: api.todos.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Не удалось обновить задачу");
      return api.todos.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.todos.list.path] });
    },
  });
}

/**
 * Хук для удаления задачи.
 */
export function useDeleteTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.todos.delete.path, { id });
      
      const res = await fetch(url, {
        method: api.todos.delete.method,
        credentials: "include",
      });

      if (!res.ok) throw new Error("Не удалось удалить задачу");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.todos.list.path] });
    },
  });
}
