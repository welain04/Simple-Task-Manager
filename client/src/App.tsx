import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "./pages/Home";

// Инструкция по запуску:
// 1. Убедитесь, что серверная часть запущена (npm run dev)
// 2. Откройте предоставленный URL приложения в браузере
// Интерфейс V1 будет сразу доступен на главной странице.

function Router() {
  return (
    <Switch>
      {/* Главная страница с нашим To-Do листом */}
      <Route path="/" component={Home} />
      
      {/* Fallback to 404 если пользователь ввел несуществующий URL */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {/* Роутер отвечает за навигацию */}
        <Router />
        {/* Toaster для всплывающих уведомлений, если они понадобятся */}
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
