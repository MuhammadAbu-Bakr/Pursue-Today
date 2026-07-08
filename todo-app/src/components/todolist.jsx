import "../App.css";
import TodoForm from "./todoForm.jsx";
import TodoItem from "./todoItem.jsx";
function Todolist() {
  return (
    <div className="todo">
      <h1 className="head">To-Do-List</h1>
      <TodoForm />
      <TodoItem />
    </div>
  );
}
export default Todolist;
