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

  const [newDueDate, setNewDueDate] = useState("");
  const [newPriority, setNewPriority] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newTags, setNewTags] = useState("");

  const [editDueDate, setEditDueDate] = useState("");
  const [editPriority, setEditPriority] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editTags, setEditTags] = useState("");

  const [filterCategory, setFilterCategory] = useState("");
  const [filterTags, setFilterTags] = useState("");

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

  async function transformText(text, action) {
    const response = await fetch(`${API_BASE}/ai/transform`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ text, action }),
    });

    const data = await response.json();

    if (!response.ok) {
      const err = new Error(data.message || "AI request failed");
      err.status = response.status;
      throw err;
    }

    return data.result;
  }

  async function applyNewTaskAction(action) {
    if (!newTask.trim()) return;
    setFixingId("new");
    try {
      const result = await transformText(newTask, action);
      setNewTask(result);
    } finally {
      setFixingId(null);
    }
  }

  async function applyEditAction(action) {
    if (!editText.trim()) return;
    setFixingId(editingId);
    try {
      const result = await transformText(editText, action);
      setEditText(result);
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
          dueDate: newDueDate || null,
          priority: newPriority,
          category: newCategory,
          tags: newTags ? newTags.split(',').map(t => t.trim()).filter(Boolean) : []
        }),
      });

      setTasks(tasks => [
        createdTask,
        ...tasks,
      ]);


      setNewTask("");
      setNewDueDate("");
      setNewPriority("");
      setNewCategory("");
      setNewTags("");
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
    setEditDueDate(task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : "");
    setEditPriority(task.priority || "");
    setEditCategory(task.category || "");
    setEditTags(task.tags ? task.tags.join(", ") : "");
  }

  function handleEditChange(event) {
    setEditText(event.target.value);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditText("");
    setEditDueDate("");
    setEditPriority("");
    setEditCategory("");
    setEditTags("");
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
            dueDate: editDueDate || null,
            priority: editPriority,
            category: editCategory,
            tags: editTags ? editTags.split(',').map(t => t.trim()).filter(Boolean) : []
          }),
        }
      );


      setTasks(tasks =>
        tasks.map(task =>
          task._id === id ? updatedTask : task
        )
      );


      cancelEdit();


    } catch (err) {
      setError(err.message);
    }
  }



  const filteredTasks = tasks
    .filter(task => {
      const matchSearch = task.text.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = filterCategory ? task.category === filterCategory : true;
      const matchTags = filterTags ? filterTags.split(',').map(t=>t.trim()).filter(Boolean).every(tag => task.tags && task.tags.includes(tag)) : true;
      return matchSearch && matchCategory && matchTags;
    })
    .sort((a, b) => {

      if (sortBy === "newest") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (sortBy === "oldest") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
      if (sortBy === "completed") {
        return (b.completed ? 1 : 0) - (a.completed ? 1 : 0);
      }
      if (sortBy === "uncompleted") {
        return (a.completed ? 1 : 0) - (b.completed ? 1 : 0);
      }
      if (sortBy === "soonest") {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      }
      if (sortBy === "latest") {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(b.dueDate) - new Date(a.dueDate);
      }
      if (sortBy === "priority-high-low") {
        const p = { High: 3, Medium: 2, Low: 1, '': 0 };
        return p[b.priority || ''] - p[a.priority || ''];
      }
      if (sortBy === "priority-low-high") {
        const p = { High: 3, Medium: 2, Low: 1, '': 0 };
        return p[a.priority || ''] - p[b.priority || ''];
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
        newDueDate, setNewDueDate,
        newPriority, setNewPriority,
        newCategory, setNewCategory,
        newTags, setNewTags,

        editingId,
        editText,
        editDueDate, setEditDueDate,
        editPriority, setEditPriority,
        editCategory, setEditCategory,
        editTags, setEditTags,

        loading,
        error,

        searchQuery,
        setSearchQuery,
        filterCategory, setFilterCategory,
        filterTags, setFilterTags,

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
        applyNewTaskAction,
        applyEditAction,
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