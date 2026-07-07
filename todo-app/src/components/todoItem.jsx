import "../App.css";
import { useTodo } from "../context/todo-context.js";

export default function TodoItem() {
  const {
    tasks,
    editingId,
    editText,
    toggleTask,
    delTask,
    startEdit,
    handleEditChange,
    cancelEdit,
    saveEdit,
  } = useTodo();
  return (
    <ol>
      {tasks.map((task) => (
        <li
          key={task.id}
          className={task.completed ? "completed" : ""}
        >
          {editingId === task.id ? (
            <div className="edit-wrapper">
             <textarea
                aria-label="Edit task"
                className="edit-textarea"
                value={editText}
                onChange={handleEditChange}
                autoFocus
              />
              <div className="edit-actions">
                <button className="cancel-btn" onClick={cancelEdit} >
                  Cancel
                </button>
                <button className="save-btn" onClick={() => saveEdit(task.id)} >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <>
              <input
                type="checkbox"
                aria-label={`Mark "${task.text}" as completed`}
                checked={task.completed}
                onChange={() => toggleTask(task.id)}
              />

              <span className="text">
                {task.text}
              </span>

              <button
                className="edit-btn"
                onClick={() => startEdit(task)}
              >
                Edit ✏️
              </button>

              <button
                className="del-btn"
                onClick={() => delTask(task.id)}
              >
                Delete 🗑️
              </button>
            </>
          )}
        </li>
      ))}
    </ol>
  );
}