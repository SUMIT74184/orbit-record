import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Check, Trash2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DashboardLayout from "@/components/DashboardLayout";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

const initialTodos: Todo[] = [
  { id: "1", text: "Complete project documentation", completed: true, createdAt: new Date() },
  { id: "2", text: "Review pull requests", completed: false, createdAt: new Date() },
  { id: "3", text: "Update design system tokens", completed: false, createdAt: new Date() },
  { id: "4", text: "Write unit tests for auth flow", completed: false, createdAt: new Date() },
  { id: "5", text: "Deploy staging environment", completed: true, createdAt: new Date() },
];

const Todos = () => {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [newTodo, setNewTodo] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  const addTodo = () => {
    if (!newTodo.trim()) return;
    setTodos([{ id: Date.now().toString(), text: newTodo.trim(), completed: false, createdAt: new Date() }, ...todos]);
    setNewTodo("");
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter((t) => t.id !== id));
  };

  const filtered = todos.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  const completedCount = todos.filter((t) => t.completed).length;

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Todos</h1>
          <p className="text-muted-foreground mt-1">
            {completedCount}/{todos.length} completed
          </p>
        </div>

        {/* Progress bar */}
        <div className="h-2 rounded-full bg-secondary mb-8 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${todos.length ? (completedCount / todos.length) * 100 : 0}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Add todo */}
        <div className="flex gap-3 mb-6">
          <Input
            placeholder="Add a new task..."
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTodo()}
            className="h-11 bg-secondary border-border"
          />
          <Button variant="hero" className="h-11 px-6" onClick={addTodo}>
            <Plus size={18} />
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {(["all", "active", "completed"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-sm capitalize transition-all ${
                filter === f
                  ? "bg-primary/15 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Todo list */}
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {filtered.map((todo) => (
              <motion.div
                key={todo.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                layout
                className="glass-card p-4 flex items-center gap-3 group"
              >
                <button onClick={() => toggleTodo(todo.id)} className="flex-shrink-0">
                  {todo.completed ? (
                    <Check size={20} className="text-primary" />
                  ) : (
                    <Circle size={20} className="text-muted-foreground hover:text-primary transition-colors" />
                  )}
                </button>
                <span className={`flex-1 text-sm ${todo.completed ? "line-through text-muted-foreground" : ""}`}>
                  {todo.text}
                </span>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              {filter === "all" ? "No todos yet. Add one above!" : `No ${filter} todos.`}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Todos;
