import React, { useState } from 'react'
import '../App.css'
import ToDoForm from './todoForm.jsx'
import ToDoItem from './todoItem.jsx'

function Todolist() {
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
      addTask();
    }
  }

  function toggleTask(id) {
    setTasks(t => t.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  }

  function addTask() {
    const trimmed = newTask.trim();
    if (trimmed !== "") {
      const newTaskObj = { id: Date.now(), text: trimmed, completed: false };
      setTasks(t => [...t, newTaskObj]);
      setNewTask("");
      alert(`Task "${trimmed}" added Successfuly`);
    } else {
      alert("Write a task before submission");
    }
  }

  function delTask(id) {
    setTasks(t => t.filter(task => task.id !== id));
    alert("Task Deleted Successfuly");
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
    if (trimmed === "") {
      alert("Task can't be empty");
      return;
    }
    setTasks(t => t.map(task =>
      task.id === id ? { ...task, text: trimmed } : task
    ));
    setEditingId(null);
    setEditText("");
    alert("Task updated successfully");
  }

  return (
    <div className="todo">
      <h1 className="head">To-Do-List</h1>
      <ToDoForm
        newTask={newTask}
        handleInputChange={handleInputChange}
        addTask={addTask}
        handleKeyDown={handleKeyDown}
      />
      <ToDoItem
        tasks={tasks}
        toggleTask={toggleTask}
        delTask={delTask}
        editingId={editingId}
        editText={editText}
        startEdit={startEdit}
        handleEditChange={handleEditChange}
        cancelEdit={cancelEdit}
        saveEdit={saveEdit}
      />
    </div>
  );
}

export default Todolist