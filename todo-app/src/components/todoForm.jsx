import "../App.css";
import { useTodo } from "../context/todo-context.js";

export default function TodoForm() {
  const {
    newTask,
    handleInputChange,
    handleKeyDown,
    addTask,
  } = useTodo();

  function handleSubmit(e) {
    e.preventDefault();
    addTask();
  }

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        aria-label="Enter a new task"
        placeholder="Enter the Task"
        value={newTask}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
      />

      <button className="add-btn" type="submit">
        Add
      </button>
    </form>
  );
}