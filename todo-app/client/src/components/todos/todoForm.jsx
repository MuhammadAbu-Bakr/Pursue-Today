import {
  Paper,
  TextField,
  Button,
  Stack,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";

import { useTodo } from "../../context/todo-context.jsx";
import { API_BASE } from "../../context/auth-context.jsx";

export default function TodoForm() {
  const {
    newTask,
    setNewTask,          // <- Add this to your context
    handleInputChange,
    handleKeyDown,
    addTask,
    isAdding,
  } = useTodo();

  async function fixGrammar() {
    if (!newTask.trim()) return;

    try {
      const response = await fetch(`${API_BASE}/ai/correct`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          text: newTask,
        }),
      });

      const data = await response.json();

      setNewTask(data.corrected);
    } catch (err) {
      console.error(err);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    addTask();
  }

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        mb: 3,
        borderRadius: 3,
      }}
    >
      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField
            label="New Task"
            placeholder="Enter your task..."
            multiline
            minRows={3}
            fullWidth
            value={newTask}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />

          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              startIcon={<AutoFixHighIcon />}
              onClick={fixGrammar}
            >
              Fix Grammar
            </Button>

            <Button
              type="submit"
              variant="contained"
              startIcon={
                isAdding ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <AddIcon />
                )
              }
              disabled={isAdding}
            >
              {isAdding ? "Adding..." : "Add Task"}
            </Button>
          </Stack>
        </Stack>
      </form>
    </Paper>
  );
}