import "../App.css";
import { useTodo } from "../context/TodoContext";

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
      <button className="add-Btn" onClick={addTask}>
        Add
      </button>
    </>
  );
}