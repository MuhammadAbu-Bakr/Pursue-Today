import { useState } from "react";
import {
  Paper,
  TextField,
  Button,
  Stack,
  CircularProgress,
  Snackbar,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
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
    newDueDate, setNewDueDate,
    newPriority, setNewPriority,
    newCategory, setNewCategory,
    newTags, setNewTags,
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

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label="Due Date & Time"
                  type="datetime-local"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={newPriority}
                    label="Priority"
                    onChange={(e) => setNewPriority(e.target.value)}
                  >
                    <MenuItem value=""><em>None</em></MenuItem>
                    <MenuItem value="Low">Low</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="High">High</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label="Category"
                  placeholder="e.g. Work"
                  fullWidth
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label="Tags"
                  placeholder="Comma separated"
                  fullWidth
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                />
              </Grid>
            </Grid>

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