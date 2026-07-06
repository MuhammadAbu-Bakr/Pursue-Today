import "../App.css";
import ToDoForm from "./todoForm";
import TodoItem from "./todoItem";
function Todolist() {
  return (
    <div className="todo">
      <h1 className="head">To-Do-List</h1>
      <ToDoForm />
      <TodoItem />
    </div>
  );
}
export default Todolist;