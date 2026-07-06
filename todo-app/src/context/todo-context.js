import { createContext, useContext } from "react";

export const TodoContext = createContext();

export function useTodo() {
  const context =useContext(TodoContext);
  if (!context){
  throw new Error("useTodo must be within a TodoProvider");
  }
  return context;
}

