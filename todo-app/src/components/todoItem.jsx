import "../App.css";
import { useTodo } from "../context/todo-context.js";

export default function TodoItem() {
  const {
    tasks,
    editingId,
    editText,
    loading,
    error,
    toggleTask,
    delTask,
    startEdit,
    handleEditChange,
    cancelEdit,
    saveEdit,
  } = useTodo();

  if (loading) {
    return <p className="status-message">Loading tasks...</p>;
  }

  if (error) {
    return <p className="status-message error-message">{error}</p>;
  }

  if (tasks.length === 0) {
    return <p className="status-message">No tasks yet.</p>;
  }

  return (
    <ol>
      {tasks.map((task) => (
        <li
          key={task._id}
          className={task.completed ? "completed" : ""}
        >
          {editingId === task._id ? (
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
                <button className="save-btn" onClick={() => saveEdit(task._id)} >
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
                onChange={() => toggleTask(task._id)}
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
                onClick={() => delTask(task._id)}
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
