import TodoItem from './todo-item'
import { Todo } from '@/types/todo'

interface TodoListProps {
  todos: Todo[]
  onToggleTodo: (id: string, completed: boolean) => Promise<void>
  onDeleteTodo: (id: string) => Promise<void>
  onUpdateTodo: (id: string, text: string) => Promise<void>
}

export default function TodoList({ todos, onToggleTodo, onDeleteTodo, onUpdateTodo }: TodoListProps) {
  if (todos.length === 0) {
    return (
      <div className="text-center py-16 px-6 bg-white/60 rounded-xl">
        <h2 className="text-2xl font-bold text-slate-700 mb-2">Die Liste ist leer!</h2>
        <p className="text-slate-500">Füge eine neue Aufgabe hinzu, um loszulegen.</p>
      </div>
    )
  }

  return (
    <main className="space-y-3">
      {todos.map(todo => (
        <TodoItem 
          key={todo.id} 
          todo={todo}
          onToggle={onToggleTodo}
          onDelete={onDeleteTodo}
          onUpdate={onUpdateTodo}
        />
      ))}
    </main>
  )
}