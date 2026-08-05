/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/set-state-in-effect */

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

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


function formatTags(tags) {
  if (!tags) return [];

  return tags
    .split(",")
    .map(tag => tag.trim())
    .filter(Boolean);
}


function formatDate(date) {
  if (!date) return "";

  return new Date(date)
    .toISOString()
    .slice(0, 16);
}



export function TodoProvider({ children }) {

  const { user } = useAuth();


  const [tasks, setTasks] = useState([]);

  const [newTask, setNewTask] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");


  const [newDueDate, setNewDueDate] = useState("");
  const [newPriority, setNewPriority] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newTags, setNewTags] = useState("");


  const [editDueDate, setEditDueDate] = useState("");
  const [editPriority, setEditPriority] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editTags, setEditTags] = useState("");


  const [searchQuery, setSearchQuery] = useState("");

  const [filterCategory, setFilterCategory] = useState("");
  const [filterTags, setFilterTags] = useState("");

  const [sortBy, setSortBy] = useState("newest");


  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  const [isAdding, setIsAdding] = useState(false);

  const [togglingId, setTogglingId] = useState(null);

  const [fixingId, setFixingId] = useState(null);



  useEffect(() => {

    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }


    async function loadTasks() {

      try {

        setLoading(true);
        setError("");

        const data = await requestTodos(API_URL);

        setTasks(data);

      } catch(err) {

        setError(err.message);

      } finally {

        setLoading(false);

      }

    }


    loadTasks();


  }, [user]);




  async function transformText(text, action) {

    const response = await fetch(
      `${API_BASE}/ai/transform`,
      {
        method:"POST",

        headers:{
          "Content-Type":"application/json",
        },

        credentials:"include",

        body:JSON.stringify({
          text,
          action,
        }),
      }
    );


    const data = await response.json();


    if(!response.ok){

      throw new Error(
        data.message || "AI failed"
      );

    }


    return data.result;

  }




  async function applyNewTaskAction(action){

    if(!newTask.trim()) return;


    try{

      setFixingId("new");


      const result =
        await transformText(newTask, action);


      setNewTask(result);


    }finally{

      setFixingId(null);

    }

  }





  async function applyEditAction(action){

    if(!editText.trim()) return;


    try{

      setFixingId(editingId);


      const result =
        await transformText(editText, action);


      setEditText(result);


    }finally{

      setFixingId(null);

    }

  }




  function handleInputChange(e){

    setNewTask(e.target.value);

  }




  function handleKeyDown(e){

    if(e.key==="Enter"){

      e.preventDefault();

      addTask();

    }

  }





  async function addTask(){

    const text = newTask.trim();


    if(!text){

      alert("Write a task before submission");

      return;

    }


    try{

      setIsAdding(true);
      setError("");


      const task =
        await requestTodos(
          API_URL,
          {
            method:"POST",

            headers:{
              "Content-Type":"application/json",
            },

            body:JSON.stringify({

              text,

              dueDate:newDueDate || null,

              priority:newPriority,

              category:newCategory,

              tags:formatTags(newTags),

            }),
          }
        );



      setTasks(prev=>[
        task,
        ...prev
      ]);


      setNewTask("");
      setNewDueDate("");
      setNewPriority("");
      setNewCategory("");
      setNewTags("");


    }catch(err){

      setError(err.message);

    }finally{

      setIsAdding(false);

    }

  }





  async function toggleTask(id){

    try{

      setTogglingId(id);


      const updated =
        await requestTodos(
          `${API_URL}/${id}/toggle`,
          {
            method:"PATCH",
          }
        );


      setTasks(prev =>
        prev.map(task =>
          task._id===id
            ? updated
            : task
        )
      );


    }catch(err){

      setError(err.message);

    }finally{

      setTogglingId(null);

    }

  }





  async function delTask(id){

    await requestTodos(
      `${API_URL}/${id}`,
      {
        method:"DELETE",
      }
    );


    setTasks(prev =>
      prev.filter(
        task=>task._id!==id
      )
    );

  }





  function startEdit(task){

    setEditingId(task._id);

    setEditText(task.text);

    setEditDueDate(
      formatDate(task.dueDate)
    );

    setEditPriority(
      task.priority || ""
    );

    setEditCategory(
      task.category || ""
    );

    setEditTags(
      task.tags?.join(", ") || ""
    );

  }





  function cancelEdit(){

    setEditingId(null);

    setEditText("");

    setEditDueDate("");

    setEditPriority("");

    setEditCategory("");

    setEditTags("");

  }




  async function saveEdit(id){

    const text = editText.trim();


    if(!text)return;



    const updated =
      await requestTodos(
        `${API_URL}/${id}`,
        {

          method:"PUT",

          headers:{
            "Content-Type":"application/json",
          },


          body:JSON.stringify({

            text,

            dueDate:editDueDate || null,

            priority:editPriority,

            category:editCategory,

            tags:formatTags(editTags),

          }),

        }
      );



    setTasks(prev =>
      prev.map(task =>
        task._id===id
          ? updated
          : task
      )
    );


    cancelEdit();

  }





  const filteredTasks =
    [...tasks]

    .filter(task=>{

      const search =
        task.text
        .toLowerCase()
        .includes(
          searchQuery.toLowerCase()
        );


      const category =
        filterCategory
        ? task.category===filterCategory
        : true;



      const tags =
        filterTags
        ? formatTags(filterTags)
            .every(tag =>
              task.tags?.includes(tag)
            )
        : true;


      return search && category && tags;

    })


    .sort((a,b)=>{

      if(sortBy==="newest")
        return new Date(b.createdAt)-new Date(a.createdAt);


      if(sortBy==="oldest")
        return new Date(a.createdAt)-new Date(b.createdAt);


      if(sortBy==="soonest")
        return new Date(a.dueDate||Infinity)
        - new Date(b.dueDate||Infinity);



      if(sortBy==="latest")
        return new Date(b.dueDate||0)
        - new Date(a.dueDate||0);



      const priority={
        High:3,
        Medium:2,
        Low:1,
        "":0,
      };


      if(sortBy==="priority-high-low")
        return priority[b.priority]-priority[a.priority];


      if(sortBy==="priority-low-high")
        return priority[a.priority]-priority[b.priority];


      return 0;

    });




  return (

    <TodoContext.Provider
      value={{

        tasks,

        filteredTasks,


        newTask,
        setNewTask,

        newDueDate,
        setNewDueDate,

        newPriority,
        setNewPriority,

        newCategory,
        setNewCategory,

        newTags,
        setNewTags,


        editingId,

        editText,

        editDueDate,
        setEditDueDate,

        editPriority,
        setEditPriority,

        editCategory,
        setEditCategory,

        editTags,
        setEditTags,


        loading,

        error,


        searchQuery,
        setSearchQuery,


        filterCategory,
        setFilterCategory,


        filterTags,
        setFilterTags,


        sortBy,
        setSortBy,


        isAdding,

        togglingId,


        fixingId,


        handleInputChange,

        handleKeyDown,


        toggleTask,

        addTask,

        delTask,


        startEdit,

        handleEditChange:
          e=>setEditText(e.target.value),


        cancelEdit,

        saveEdit,


        applyNewTaskAction,

        applyEditAction,

      }}

    >

      {children}

    </TodoContext.Provider>

  );

}




export function useTodo(){

  const context =
    useContext(TodoContext);


  if(!context){

    throw new Error(
      "useTodo must be inside TodoProvider"
    );

  }


  return context;

}