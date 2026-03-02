import { z } from 'zod';
import { insertTodoSchema, updateTodoSchema, todos } from './schema';

// Общие схемы ошибок, чтобы фронтенд понимал, что пошло не так
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
};

// Описание нашего API: какие эндпоинты существуют, какие данные ожидают и что возвращают
export const api = {
  todos: {
    list: {
      method: 'GET' as const,
      path: '/api/todos' as const,
      responses: {
        200: z.array(z.custom<typeof todos.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/todos' as const,
      input: insertTodoSchema,
      responses: {
        201: z.custom<typeof todos.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/todos/:id' as const,
      input: updateTodoSchema,
      responses: {
        200: z.custom<typeof todos.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/todos/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
};

// Утилита для подстановки параметров в URL (например, :id -> 1)
export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
