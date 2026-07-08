import { useState, useEffect } from "react";
import { TodoContext } from "./todo-context.js";

const API_URL = "https://pursue-today-api.onrender.com/api/todos";

export function TodoProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  
  useEffect(() => {
    async function fetchTasks() {
      const response = await fetch(API_URL);
      const data = await response.json();
      setTasks(data);
    }

    fetchTasks();
  }, []);


  function handleInputChange(event) {
    setNewTask(event.target.value);
  }
  function handleKeyDown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      addTask();
    }
  }
  async function toggleTask(id) {
    const response = await fetch(`${API_URL}/${id}/toggle`, {
      method: "PATCH",
    });
    const updatedTask = await response.json();

    setTasks(tasks =>
      tasks.map(task => (task._id === id ? updatedTask : task))
    );
  }
  async function addTask() {
    const trimmed = newTask.trim();
    if (!trimmed) {
      alert("Write a task before submission");
      return;
    }
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: trimmed }),
    });
    const createdTask = await response.json();

    setTasks(tasks => [createdTask, ...tasks]);
    setNewTask("");
  }
  async function delTask(id) {
    // const confirmed = window.confirm(
    //   "⚠️ Are you sure you want to delete this task?"
    // );
    // if (!confirmed) return;
    await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    setTasks(tasks => tasks.filter(task => task._id !== id));
  }
  function startEdit(task) {
    setEditingId(task._id);
    setEditText(task.text);
  }
  function handleEditChange(event) {
    setEditText(event.target.value);
  }
  function cancelEdit() {
    setEditingId(null);
    setEditText("");
  }
  async function saveEdit(id) {
    const trimmed = editText.trim();
    if (!trimmed) {
      alert("Task can't be empty");
      return;
    }
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: trimmed }),
    });
    const updatedTask = await response.json();

    setTasks(tasks =>
      tasks.map(task => (task._id === id ? updatedTask : task))
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
