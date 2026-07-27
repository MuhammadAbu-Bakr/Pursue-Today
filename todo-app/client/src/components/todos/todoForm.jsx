import { useState } from "react";
import {
  Paper,
  TextField,
  Button,
  Stack,
  CircularProgress,
  Snackbar,
  Alert,
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

  const [isFixing, setIsFixing] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "error" });

  function closeSnackbar() {
    setSnackbar((s) => ({ ...s, open: false }));
  }

  async function fixGrammar() {
    if (!newTask.trim()) return;

    setIsFixing(true);
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

      if (response.ok && data.corrected) {
        setNewTask(data.corrected);
        setSnackbar({ open: true, message: "Grammar corrected!", severity: "success" });
      } else if (response.status === 429) {
        setSnackbar({
          open: true,
          message: "AI quota exceeded — please try again later.",
          severity: "warning",
        });
      } else {
        console.error("AI correction failed:", data.message);
        setSnackbar({
          open: true,
          message: data.message || "AI correction failed. Please try again.",
          severity: "error",
        });
      }
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: "Could not reach the AI service. Check your connection.",
        severity: "error",
      });
    } finally {
      setIsFixing(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    addTask();
  }

  return (
    <>
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
                startIcon={
                  isFixing ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <AutoFixHighIcon />
                  )
                }
                onClick={fixGrammar}
                disabled={isFixing}
              >
                {isFixing ? "Fixing..." : "Fix Grammar"}
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

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={closeSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}