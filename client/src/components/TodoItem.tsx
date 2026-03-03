import { useState, useRef, useEffect } from "react";
import { Check, Trash2, Pencil, X } from "lucide-react";
import { motion } from "framer-motion";
import { useUpdateTodo, useDeleteTodo } from "@/hooks/use-todos";
import type { Todo } from "@shared/schema";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface TodoItemProps {
  todo: Todo;
}

export function TodoItem({ todo }: TodoItemProps) {
  // Локальные состояния для режима редактирования
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  
  // Подключаем хуки для обновления и удаления
  const updateMutation = useUpdateTodo();
  const deleteMutation = useDeleteTodo();
  
  const inputRef = useRef<HTMLInputElement>(null);

  // Фокус на инпут при включении режима редактирования
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  // Переключение статуса (выполнено/не выполнено)
  const toggleCompleted = () => {
    updateMutation.mutate({
      id: todo.id,
      updates: { completed: !todo.completed },
    });
  };

  // Сохранение отредактированного текста
  const handleSaveEdit = () => {
    const trimmedTitle = editTitle.trim();
    if (trimmedTitle && trimmedTitle !== todo.title) {
      updateMutation.mutate({
        id: todo.id,
        updates: { title: trimmedTitle },
      });
    } else {
      // Если текст пустой или не изменился, возвращаем как было
      setEditTitle(todo.title);
    }
    setIsEditing(false);
  };

  // Отмена редактирования
  const handleCancelEdit = () => {
    setEditTitle(todo.title);
    setIsEditing(false);
  };

  const handleDelete = () => {
    deleteMutation.mutate(todo.id);
  };

  return (
    <motion.div
      layout // Плавная анимация изменения позиции в списке
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className={`
        group relative flex items-center gap-4 p-4 mb-3 rounded-2xl
        bg-card border shadow-sm shadow-black/5
        transition-all duration-300
        ${todo.completed ? 'border-border bg-muted/30' : 'border-border/50 hover:border-primary/30 hover:shadow-md'}
      `}
    >
      {/* Кнопка выполнения (чекбокс) */}
      <button
        onClick={toggleCompleted}
        className={`
          flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center
          transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/20
          ${todo.completed 
            ? 'bg-primary border-primary text-white' 
            : 'border-muted-foreground/30 hover:border-primary text-transparent'}
        `}
        aria-label={todo.completed ? "Отметить как невыполненное" : "Отметить как выполненное"}
      >
        <Check strokeWidth={3} className="w-3.5 h-3.5" />
      </button>

      {/* Текст задачи или поле ввода */}
      <div className="flex-grow min-w-0">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleSaveEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveEdit();
              if (e.key === 'Escape') handleCancelEdit();
            }}
            className="w-full px-2 py-1 -ml-2 text-foreground bg-background border border-primary/50 rounded-lg outline-none ring-2 ring-primary/20 transition-all font-medium"
          />
        ) : (
          <span 
            className={`
              block truncate text-lg transition-all duration-300
              ${todo.completed ? 'text-muted-foreground line-through' : 'text-foreground font-medium'}
            `}
          >
            {todo.title}
          </span>
        )}
      </div>

      {/* Кнопки действий (редактировать/удалить) */}
      <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
        {isEditing ? (
          <button
            onClick={handleCancelEdit}
            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
            title="Отменить"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-colors"
            title="Редактировать"
          >
            <Pencil className="w-4 h-4" />
          </button>
        )}

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
              title="Удалить"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Удалить задачу?</AlertDialogTitle>
              <AlertDialogDescription>
                Вы уверены, что хотите удалить эту задачу? Это действие нельзя будет отменить.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Отмена</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>
                Удалить
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </motion.div>
  );
}
