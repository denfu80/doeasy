import TodoItem from './todo-item'
import { Todo, User } from '@/types/todo'

interface TodoListProps {
  todos: Todo[]
  users: User[]
  currentUserId?: string
  onToggleTodo: (id: string, completed: boolean) => Promise<void>
  onDeleteTodo: (id: string) => Promise<void>
  onUpdateTodo: (id: string, text: string) => Promise<void>
  onEditingChange: (todoId: string | null, isTyping: boolean) => void
}

export default function TodoList({ todos, users, currentUserId, onToggleTodo, onDeleteTodo, onUpdateTodo, onEditingChange }: TodoListProps) {
  if (todos.length === 0) {
    return (
      <div className="text-center py-8 md:py-16 px-4 md:px-6 bg-white/60 rounded-lg md:rounded-xl">
        <h2 className="text-lg md:text-2xl font-bold text-slate-700 mb-2">Die Liste ist leer!</h2>
        <p className="text-sm md:text-base text-slate-500">Füge eine neue Aufgabe hinzu, um loszulegen.</p>
      </div>
    )
  }

  return (
    <main className="space-y-2 md:space-y-3">
      {todos.map(todo => (
        <TodoItem 
          key={todo.id} 
          todo={todo}
          users={users}
          currentUserId={currentUserId}
          onToggle={onToggleTodo}
          onDelete={onDeleteTodo}
          onUpdate={onUpdateTodo}
          onEditingChange={onEditingChange}
        />
      ))}
    </main>
  )
}