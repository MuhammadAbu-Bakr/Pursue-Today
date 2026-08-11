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
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

import { useTodo }         from "../../context/todo-context.jsx";
import AIActionsButton     from "../ai/AIActionsButton.jsx";
import AttachmentUploader  from "./AttachmentUploader.jsx";

export default function TodoForm() {
  const {
    newTask,
    handleInputChange,
    handleKeyDown,
    addTask,
    isAdding,
    fixingId,
    applyNewTaskAction,
    newDueDate,   setNewDueDate,
    newPriority,  setNewPriority,
    newCategory,  setNewCategory,
    newTags,      setNewTags,
    uploadAttachments,
  } = useTodo();

  const isFixing = fixingId === "new";

  const [pendingFiles, setPendingFiles] = useState([]);

  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "error" });

  function closeSnackbar() {
    setSnackbar((s) => ({ ...s, open: false }));
  }

  function showSnackbar(message, severity = "error") {
    setSnackbar({ open: true, message, severity });
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
      showSnackbar(message, err.status === 429 ? "warning" : "error");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    let createdTask;
    try {
      createdTask = await addTask();
    } catch (err) {
      return;
    }

    if (createdTask && pendingFiles.length > 0) {
      try {
        await uploadAttachments(createdTask._id, pendingFiles);
        setPendingFiles([]);
      } catch (err) {
        showSnackbar(
          err.message || "Task created but file upload failed. You can re-attach files by editing the task.",
          "warning"
        );
        setPendingFiles([]);
      }
    }
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
              <Grid item xs={12} sm={6}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", mb: 0.5 }}
                >
                  Due Date
                </Typography>
                <TextField
                  type="datetime-local"
                  fullWidth
                  size="small"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth sx={{ minWidth: 220 }}>
                  <InputLabel id="new-priority-label">Priority</InputLabel>
                  <Select
                    labelId="new-priority-label"
                    value={newPriority}
                    label="Priority"
                    onChange={(e) => setNewPriority(e.target.value)}
                    sx={{ width: "100%" }}
                  >
                    <MenuItem value=""><em>None</em></MenuItem>
                    <MenuItem value="Low">Low</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="High">High</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Category"
                  placeholder="e.g. Work"
                  fullWidth
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Tags"
                  placeholder="Comma separated"
                  fullWidth
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                />
              </Grid>

              <Grid item xs={12}>
                <AttachmentUploader
                  pendingFiles={pendingFiles}
                  onFilesChange={setPendingFiles}
                  existingCount={0}
                  disabled={isAdding}
                />
              </Grid>
            </Grid>

            <Stack direction="row" spacing={2} justifyContent="flex-end" flexWrap="wrap">
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
        autoHideDuration={6000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={closeSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}