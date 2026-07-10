/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/set-state-in-effect */
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth, API_BASE } from "./auth-context.jsx";

const API_URL = `${API_BASE}/todos`;

const TodoContext = createContext();

async function requestTodos(url, options = {}) {
  const response = await fetch(url, {
    credentials: "include", 
    ...options,
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

export function TodoProvider({ children }) {
  const { user } = useAuth(); 
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }

    async function fetchTasks() {
      try {
        setLoading(true);
        setError("");
        const data = await requestTodos(API_URL);
        setTasks(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchTasks();
  }, [user]);

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
    try {
      setError("");
      const updatedTask = await requestTodos(`${API_URL}/${id}/toggle`, {
        method: "PATCH",
      });

      setTasks(tasks =>
        tasks.map(task => (task._id === id ? updatedTask : task))
      );
    } catch (err) {
      setError(err.message);
    }
  }

  async function addTask() {
    const trimmed = newTask.trim();
    if (!trimmed) {
      alert("Write a task before submission");
      return;
    }

    try {
      setError("");
      const createdTask = await requestTodos(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: trimmed }),
      });

      setTasks(tasks => [createdTask, ...tasks]);
      setNewTask("");
    } catch (err) {
      setError(err.message);
    }
  }
  async function delTask(id) {
    try {
      setError("");
      await requestTodos(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      setTasks(tasks => tasks.filter(task => task._id !== id));
    } catch (err) {
      setError(err.message);
    }
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

    try {
      setError("");
      const updatedTask = await requestTodos(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: trimmed }),
      });

      setTasks(tasks =>
        tasks.map(task => (task._id === id ? updatedTask : task))
      );
      setEditingId(null);
      setEditText("");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <TodoContext.Provider
      value={{
        tasks,
        newTask,
        editingId,
        editText,
        loading,
        error,
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

export function useTodo() {
  const context = useContext(TodoContext);

  if (!context) {
    throw new Error("useTodo must be within a TodoProvider");
  }

  return context;
}