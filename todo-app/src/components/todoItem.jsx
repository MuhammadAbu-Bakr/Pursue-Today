import '../App.css'

export default function TodoItem(props) {
  return (
    <ol>
      {props.tasks.map((task) => (
        <li key={task.id} className={task.completed ? "completed" : ""}>
          {props.editingId === task.id ? (
            <div className="edit-wrapper">
              <textarea
                className="edit-textarea"
                value={props.editText}
                onChange={props.handleEditChange}
                autoFocus
              />
              <div className="edit-actions">
                <button className="cancel-Btn" onClick={props.cancelEdit}>
                  Cancel
                </button>
                <button className="save-Btn" onClick={() => props.saveEdit(task.id)}>
                  Save
                </button>
              </div>
            </div>
          ) : (
            <>
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => props.toggleTask(task.id)}
              />
              <span className="text">{task.text}</span>
              <button className="edit-Btn" onClick={() => props.startEdit(task)}>
                Edit ✏️
              </button>
              <button className="del-Btn" onClick={() => props.delTask(task.id)}>
                Delete 🗑️
              </button>
            </>
          )}
        </li>
      ))}
    </ol>
  );
}