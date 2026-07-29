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

import { useTodo } from "../../context/todo-context.jsx";
import AIActionsButton from "../ai/AIActionsButton.jsx";

export default function TodoForm() {
  const {
    newTask,
    handleInputChange,
    handleKeyDown,
    addTask,
    isAdding,
    fixingId,
    applyNewTaskAction,
  } = useTodo();

  const isFixing = fixingId === "new";

  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "error" });

  function closeSnackbar() {
    setSnackbar((s) => ({ ...s, open: false }));
  }

  async function handleAction(action) {
    if (!newTask.trim()) return;

    try {
      await applyNewTaskAction(action);
    } catch (err) {
      console.error(err);
      const message =
        err.status === 429
          ? "AI quota exceeded — please try again later."
          : err.message || "AI request failed. Please try again.";
      setSnackbar({
        open: true,
        message,
        severity: err.status === 429 ? "warning" : "error",
      });
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    addTask();
  }

  return (
    <>
      <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
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
              <AIActionsButton isLoading={isFixing} onSelect={handleAction} />

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