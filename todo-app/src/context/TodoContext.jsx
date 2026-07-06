import { useState } from "react";
import { TodoContext } from "./todo-context.js";

export function TodoProvider({ children }) {
  const [tasks, setTasks] = useState([
    { id: 1, text: "Learn React", completed: false },
    { id: 2, text: "Read Book", completed: false },
  ]);
  const [newTask, setNewTask] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  function handleInputChange(event) {
    setNewTask(event.target.value);
  }
  function handleKeyDown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      addTask();
    }
  }
  function toggleTask(id) {
    setTasks(tasks =>
      tasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  }
  function addTask() {
    const trimmed = newTask.trim();
    if (!trimmed) {
      alert("Write a task before submission");
      return;
    }
    setTasks(tasks => [
      ...tasks,
      { id: Date.now(), text: trimmed, completed: false },
    ]);
    setNewTask("");
  }
  function delTask(id) {
    const confirmed = window.confirm(
      "⚠️ Are you sure you want to delete this task?"
    );
    if (!confirmed) return;
    setTasks(tasks => tasks.filter(task => task.id !== id));
  }
  function startEdit(task) {
    setEditingId(task.id);
    setEditText(task.text);
  }
  function handleEditChange(event) {
    setEditText(event.target.value);
  }
  function cancelEdit() {
    setEditingId(null);
    setEditText("");
  }
  function saveEdit(id) {
    const trimmed = editText.trim();
    if (!trimmed) {
      alert("Task can't be empty");
      return;
    }
    setTasks(tasks =>
      tasks.map(task =>
        task.id === id ? { ...task, text: trimmed } : task
      )
    );
    setEditingId(null);
    setEditText("");
  }

  return (
    <TodoContext.Provider
      value={{
        tasks,
        newTask,
        editingId,
        editText,
        handleInputChange,
        handleKeyDown,
        toggleTask,
        addTask,
        delTask,
        startEdit,
        handleEditChange,
        cancelEdit,
        saveEdit,
      }}
    >
      {children}
    </TodoContext.Provider>
  );
}