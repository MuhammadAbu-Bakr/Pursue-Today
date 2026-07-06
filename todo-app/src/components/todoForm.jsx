import "../App.css";
import { useTodo } from "../context/todo-context.js";

export default function ToDoForm() {
  const {
    newTask,
    handleInputChange,
    handleKeyDown,
    addTask,
  } = useTodo();
  return (
    <>
      <div>
        <textarea
          placeholder="Enter the Task"
          value={newTask}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
      </div>
      <button className="add-btn" onClick={addTask}>
        Add
      </button>
    </>
  );
}