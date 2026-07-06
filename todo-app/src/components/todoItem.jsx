import "../App.css";
import { useTodo } from "../context/TodoContext";

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
                className="edit-textarea"
                value={editText}
                onChange={handleEditChange}
                autoFocus
              />
              <div className="edit-actions">
                <button className="cancel-Btn" onClick={cancelEdit} >
                  Cancel
                </button>
                <button className="save-Btn" onClick={() => saveEdit(task.id)} >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <>
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTask(task.id)}
              />

              <span className="text">
                {task.text}
              </span>

              <button
                className="edit-Btn"
                onClick={() => startEdit(task)}
              >
                Edit ✏️
              </button>

              <button
                className="del-Btn"
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