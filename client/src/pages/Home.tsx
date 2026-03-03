import { useState, useMemo } from "react";
import { useTodos, useCreateTodo } from "@/hooks/use-todos";
import { TodoItem } from "@/components/TodoItem";
import { insertTodoSchema } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle, ListTodo, AlertCircle, Check, Filter } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  const [newTodoTitle, setNewTodoTitle] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  
  const { data: todos, isLoading, error: fetchError } = useTodos();
  const createMutation = useCreateTodo();

  // Фильтрация и сортировка задач
  const filteredTodos = useMemo(() => {
    if (!todos) return [];

    const matchesFilter = (todo: (typeof todos)[number]) => {
      if (filter === "active") return !todo.completed;
      if (filter === "completed") return todo.completed;
      return true; // остальные значения filter — показываем все
    };

    return [...todos]
      .filter(matchesFilter)
      .sort((a, b) => Number(a.completed) - Number(b.completed));
  }, [todos, filter]);

  // Функция добавления новой задачи
  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Очищаем предыдущую ошибку
    setValidationError(null);

    // Локальная валидация с использованием Drizzle/Zod схемы
    const result = insertTodoSchema.safeParse({ title: newTodoTitle });
    
    if (!result.success) {
      // Показываем первую ошибку валидации пользователю
      setValidationError(result.error.errors[0].message);
      return;
    }

    createMutation.mutate(
      { title: newTodoTitle },
      {
        onSuccess: () => {
          setNewTodoTitle(""); // Очищаем поле после успешного добавления
        },
        onError: (err) => {
          setValidationError(err.message);
        }
      }
    );
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      {/* Главный контейнер */}
      <div className="w-full max-w-2xl">
        
        {/* Заголовок с градиентом и особой типографикой */}
        <header className="mb-10 text-center">
          <motion.div 
            initial={{ y: -20, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }}
            className="inline-flex items-center justify-center gap-3 mb-2"
          >
            <ListTodo className="w-10 h-10 text-primary" />
            <h1 className="text-5xl md:text-6xl font-black font-display text-gradient pb-2">
              TO-DO лист
            </h1>
          </motion.div>
          <p className="text-muted-foreground text-lg">
            Организуй свои дела красиво и просто
          </p>
        </header>

        {/* Форма добавления задачи */}
        <motion.form 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleAddTodo} 
          className="mb-8 relative"
        >
          <div className="relative flex items-center">
            <input
              type="text"
              value={newTodoTitle}
              onChange={(e) => {
                setNewTodoTitle(e.target.value);
                if (validationError) setValidationError(null); // Убираем ошибку при вводе
              }}
              placeholder="Что нужно сделать?"
              className={`
                w-full pl-6 pr-32 py-5 rounded-2xl text-lg
                bg-card border-2 shadow-lg shadow-primary/5
                focus:outline-none focus:ring-4 transition-all duration-300
                ${validationError 
                  ? 'border-destructive focus:border-destructive focus:ring-destructive/10' 
                  : 'border-border focus:border-primary focus:ring-primary/10'}
              `}
            />
            <button
              type="submit"
              disabled={createMutation.isPending}
              className={`
                absolute right-2 px-6 py-3 rounded-xl font-bold flex items-center gap-2
                bg-primary text-primary-foreground shadow-md shadow-primary/30
                hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0
                disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200
              `}
            >
              {createMutation.isPending ? "Добавляем..." : "Добавить"}
              <PlusCircle className="w-5 h-5 hidden sm:block" />
            </button>
          </div>
          
          {/* Блок отображения ошибки валидации */}
          <AnimatePresence>
            {validationError && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute -bottom-8 left-4 flex items-center gap-1.5 text-sm text-destructive font-medium"
              >
                <AlertCircle className="w-4 h-4" />
                {validationError}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.form>

        {/* Фильтры */}
        {!isLoading && !fetchError && todos && todos.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6"
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="w-4 h-4" />
              <span>Фильтр:</span>
            </div>
            <Tabs 
              value={filter} 
              onValueChange={(v) => setFilter(v as any)} 
              className="w-full sm:w-auto"
            >
              <TabsList className="w-full sm:w-auto grid grid-cols-3 sm:flex">
                <TabsTrigger value="all" className="flex-1">Все</TabsTrigger>
                <TabsTrigger value="active" className="flex-1">Активные</TabsTrigger>
                <TabsTrigger value="completed" className="flex-1">Выполненные</TabsTrigger>
              </TabsList>
            </Tabs>
          </motion.div>
        )}

        {/* Скелетон загрузки */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-full h-20 rounded-2xl bg-muted/50 animate-pulse" />
            ))}
          </div>
        )}

        {/* Ошибка сервера */}
        {fetchError && (
          <div className="p-6 bg-destructive/10 text-destructive rounded-2xl border border-destructive/20 text-center">
            <h3 className="font-bold text-lg mb-1">Ошибка загрузки</h3>
            <p>{fetchError.message}</p>
          </div>
        )}

        {/* Список задач */}
        {!isLoading && !fetchError && todos && (
          <motion.div layout className="space-y-1">
            <AnimatePresence mode="popLayout">
              {filteredTodos.length === 0 ? (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-16 text-muted-foreground"
                >
                  <div className="bg-muted/50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check strokeWidth={1.5} className="w-12 h-12 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-xl font-medium text-foreground mb-2">
                    {filter === "all" ? "Всё сделано!" : "Ничего не найдено"}
                  </h3>
                  <p>
                    {filter === "all" 
                      ? "Добавьте новые задачи, чтобы начать свой день."
                      : "Попробуйте изменить параметры фильтра."}
                  </p>
                </motion.div>
              ) : (
                filteredTodos.map((todo) => (
                  <TodoItem key={todo.id} todo={todo} />
                ))
              )}
            </AnimatePresence>
          </motion.div>
        )}

      </div>
    </div>
  );
}
