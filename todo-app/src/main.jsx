import ReactDOM from "react-dom/client";
import "./index.css";

import App from "./App.jsx";
import { TodoProvider } from "./context/todo-context.jsx";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#9c27b0",
    },
  },
  shape: {
    borderRadius: 12,
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <TodoProvider>
      <App />
    </TodoProvider>
  </ThemeProvider>
);