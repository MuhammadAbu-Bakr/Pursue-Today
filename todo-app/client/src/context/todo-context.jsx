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
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [isAdding, setIsAdding] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [fixingId, setFixingId] = useState(null); 

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

  async function correctGrammar(text) {
    const response = await fetch(`${API_BASE}/ai/correct`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ text }),
    });

    const data = await response.json();

    if (!response.ok) {
      const err = new Error(data.message || "AI correction failed");
      err.status = response.status;
      throw err;
    }

    return data.corrected;
  }

  async function fixNewTaskGrammar() {
    if (!newTask.trim()) return;
    setFixingId("new");
    try {
      const corrected = await correctGrammar(newTask);
      setNewTask(corrected);
    } finally {
      setFixingId(null);
    }
  }


  async function fixEditGrammar() {
    if (!editText.trim()) return;
    setFixingId(editingId);
    try {
      const corrected = await correctGrammar(editText);
      setEditText(corrected);
    } finally {
      setFixingId(null);
    }
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
      setTogglingId(id);

      const updatedTask = await requestTodos(
        `${API_URL}/${id}/toggle`,
        {
          method: "PATCH",
        }
      );

      setTasks(tasks =>
        tasks.map(task =>
          task._id === id ? updatedTask : task
        )
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setTogglingId(null);
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
      setIsAdding(true);
      const createdTask = await requestTodos(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          text: trimmed,
        }),
      });

      setTasks(tasks => [
        createdTask,
        ...tasks,
      ]);


      setNewTask("");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsAdding(false);
    }
  }
  async function delTask(id) {
    try {
      setError("");

      await requestTodos(
        `${API_URL}/${id}`,
        {
          method: "DELETE",
        }
      );


      setTasks(tasks =>
        tasks.filter(task => task._id !== id)
      );


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

      const updatedTask = await requestTodos(
        `${API_URL}/${id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            text: trimmed,
          }),
        }
      );


      setTasks(tasks =>
        tasks.map(task =>
          task._id === id ? updatedTask : task
        )
      );


      setEditingId(null);
      setEditText("");


    } catch (err) {
      setError(err.message);
    }
  }



  const filteredTasks = tasks
    .filter(task =>
      task.text
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    )

    .sort((a, b) => {

      if (sortBy === "newest") {
        return (
          new Date(b.createdAt) -
          new Date(a.createdAt)
        );
      }


      if (sortBy === "oldest") {
        return (
          new Date(a.createdAt) -
          new Date(b.createdAt)
        );
      }


      if (sortBy === "completed") {
        return (
          (b.completed ? 1 : 0) -
          (a.completed ? 1 : 0)
        );
      }


      if (sortBy === "uncompleted") {
        return (
          (a.completed ? 1 : 0) -
          (b.completed ? 1 : 0)
        );
      }


      return 0;
    });



  return (
    <TodoContext.Provider

      value={{
        tasks,
        filteredTasks,

        newTask,
        setNewTask, 

        editingId,
        editText,

        loading,
        error,

        searchQuery,
        setSearchQuery,

        sortBy,
        setSortBy,

        isAdding,
        togglingId,


        handleInputChange,
        handleKeyDown,

        toggleTask,
        addTask,
        delTask,

        startEdit,
        handleEditChange,
        cancelEdit,
        saveEdit,

        fixingId,
        fixNewTaskGrammar,
        fixEditGrammar,
      }}

    >
      {children}

    </TodoContext.Provider>
  );
}



export function useTodo() {

  const context = useContext(TodoContext);


  if (!context) {
    throw new Error(
      "useTodo must be within a TodoProvider"
    );
  }


  return context;
}