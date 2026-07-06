import '../App.css'

export default function todoitem(props){
	
	return(
	<>
		<ol>
			{props.tasks.map((task)=>
				<li key={task.id} className={task.completed ? "completed":""}>
					<input type="checkbox" checked={task.completed} onChange={()=>props.toggleTask(task.id)} />
					<span className="text">{task.text}</span>
					<button className="edit-Btn" onClick={()=> props.editTask(task.id)}>
						Edit ✏️
					</button>
					<button className="del-Btn" onClick={()=> props.delTask(task.id)}>
						Delete 🗑️
					</button>
				</li>
			)}
		</ol>
	</>
	);
}