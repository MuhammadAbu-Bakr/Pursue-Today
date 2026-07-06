import '../App.css'
export default function ToDoForm(props){
	return(
		<>
			<div>
				<textarea type="text" placeholder="Enter the Task" value={props.newTask} onChange={props.handleInputChange} onKeyDown={props.handleKeyDown} />
			</div>
			<button className="add-Btn" onClick={props.addTask}>
				Add
			</button>
		</>
	);
}