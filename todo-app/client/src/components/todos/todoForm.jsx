import { useState } from "react";
import {
  Paper,
  TextField,
  Button,
  Stack,
  CircularProgress,
  Snackbar,
  Alert,
  Menu,
  MenuItem,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";

import { useTodo } from "../../context/todo-context.jsx";

const AI_ACTIONS = [
  { action: "correct", label: "Fix Grammar" },
  { action: "formal", label: "Formalize" },
  { action: "casual", label: "Make Casual" },
  { action: "summarize", label: "Summarize" },
  { action: "enhance", label: "Enhance" },
];

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

  const [menuAnchor, setMenuAnchor] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "error" });

  function closeSnackbar() {
    setSnackbar((s) => ({ ...s, open: false }));
  }

  function openMenu(e) {
    setMenuAnchor(e.currentTarget);
  }

  function closeMenu() {
    setMenuAnchor(null);
  }

  async function handleAction(action) {
    closeMenu();
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
                onClick={openMenu}
                disabled={isFixing}
              >
                {isFixing ? "Working..." : "AI Actions"}
              </Button>

              <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={closeMenu}>
                {AI_ACTIONS.map(({ action, label }) => (
                  <MenuItem key={action} onClick={() => handleAction(action)}>
                    {label}
                  </MenuItem>
                ))}
              </Menu>

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