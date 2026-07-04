import React, {useState} from 'react' 
import './App.css'

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
		}
	}
	
	function delTask(id){
		setTasks(t =>t.filter(task=>task.id !==id))
		
	}
	
	function editTask (id){
	}
	return(<div className="todo">
		<h1 className="head">To-Do-List</h1>
		
		<div>
			<input type="text" placeholder="Enter the Task" value={newTask} onChange={handleInputChange}	/>
		</div>
		<button className="add-Btn" onClick={addTask} >
		Add
		</button>
		
		<ol>
		{tasks.map((task)=>
			<li key={task.id} className={task.completed ? "completed":""}>
				<input type="checkbox" checked={task.completed} onChange={()=>toggleTask(task.id)} />
				<span className="text">{task.text}</span>
				<button className="edit-Btn" onClick={()=> editTask(task.id)}>
					Edit ✏️
				</button>
				<button className="del-Btn" onClick={()=> delTask(task.id)}>
					Delete 🗑️
				</button>
			</li>
		)}
		</ol>
		
	</div>);
}
export default Todolist