import React, {useState} from 'react' 
import '../App.css'
import ToDoForm from './todoForm.jsx'
import ToDoItem from './todoItem.jsx'

function Todolist(){
	const[tasks,setTasks]= useState([{id:1, text: "Learn React", completed: false},{id:2, text: "Read Book", completed: false}]);
	const[newTask,setNewTask]=useState("");
	
	function handleInputChange(event){
		setNewTask(event.target.value);
	}
	
	function toggleTask(id){
		setTasks(t=>t.map(task=>
		task.id === id ?{...task,completed: !task.completed}:task
		));
	}
	
	function addTask(){
		if(newTask.trim() !==""){
			const newTaskObj ={id:Date.now(), text: newTask, completed: false};
			setTasks(t=> [...t,newTaskObj]);
			setNewTask("");
			alert(`Task "${newTask}" added Successfuly`);
		}
		else{
			alert("Write a task before submission");
		}
	}
	
	function delTask(id){
		setTasks(t =>t.filter(task=>task.id !==id));
		alert("Task Deleted Successfuly");
		
	}
	
	function editTask (id){
		
	}
	return(
	<div className="todo">
		<h1 className="head">To-Do-List</h1>
		<ToDoForm
			
			newTask={newTask}
			handleInputChange={handleInputChange}
			addTask={addTask}
			/>		
		<ToDoItem
			tasks={tasks}
			toggleTask={toggleTask}
			editTask={editTask}
			delTask={delTask}
		/>	
	</div>
	);
}
export default Todolist


