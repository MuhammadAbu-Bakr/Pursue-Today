import ReactDOM from "react-dom/client";
import "./index.css";          // Move it here
import App from "./App";
import { TodoProvider } from "./context/todo-context.js";

ReactDOM.createRoot(document.getElementById("root")).render(
  <TodoProvider>
    <App />
  </TodoProvider>
);
