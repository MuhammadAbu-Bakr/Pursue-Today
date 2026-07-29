import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Checkbox,
  Typography,
  IconButton,
  TextField,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";

import { useTodo } from "../../context/todo-context.jsx";
import AIActionsButton from "../ai/AIActionsButton.jsx";

export default function TodoItem() {
  const [deleteId, setDeleteId] = useState(null);

  const {
    tasks,
    filteredTasks,
    editingId,
    editText,
    loading,
    error,
    togglingId,
    toggleTask,
    delTask,
    startEdit,
    handleEditChange,
    cancelEdit,
    saveEdit,
    fixingId,
    applyEditAction,
  } = useTodo();

  async function handleAction(action) {
    if (!editText.trim()) return;
    try {
      await applyEditAction(action);
    } catch (err) {
      console.error(err);
      // Optional: surface via a Snackbar/toast here if you want per-row feedback
    }
  }

  if (loading) {
    return (
      <Typography textAlign="center" sx={{ mt: 2 }}>
        Loading tasks...
      </Typography>
    );
  }

  if (error) {
    return (
      <Typography color="error" textAlign="center" sx={{ mt: 2 }}>
        {error}
      </Typography>
    );
  }

  if (tasks.length === 0) {
    return (
      <Typography textAlign="center" sx={{ mt: 2 }}>
        No tasks yet.
      </Typography>
    );
  }

  return (
    <Stack spacing={2}>
      {filteredTasks.map((task) => {
        const isFixingThis = fixingId === task._id;

        return (
          <Card key={task._id} elevation={3} sx={{ borderRadius: 3 }}>
            <CardContent>
              {editingId === task._id ? (
                <Stack spacing={2}>
                  <TextField
                    multiline
                    minRows={3}
                    fullWidth
                    label="Edit Task"
                    value={editText}
                    onChange={handleEditChange}
                    autoFocus
                  />

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: 1,
                    }}
                  >
                    <AIActionsButton isLoading={isFixingThis} onSelect={handleAction} />

                    <Button
                      variant="outlined"
                      color="inherit"
                      startIcon={<CloseIcon />}
                      onClick={cancelEdit}
                    >
                      Cancel
                    </Button>

                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={() => saveEdit(task._id)}
                    >
                      Save
                    </Button>
                  </Box>
                </Stack>
              ) : (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box sx={{ position: "relative", display: "flex", alignItems: "center" }}>
                    <Checkbox
                      checked={task.completed}
                      onChange={() => toggleTask(task._id)}
                      disabled={togglingId === task._id}
                    />
                    {togglingId === task._id && (
                      <CircularProgress
                        size={24}
                        sx={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          marginTop: "-12px",
                          marginLeft: "-12px",
                        }}
                      />
                    )}
                  </Box>

                  <Typography
                    sx={{
                      flexGrow: 1,
                      wordBreak: "break-word",
                      textDecoration: task.completed ? "line-through" : "none",
                      color: task.completed ? "text.secondary" : "text.primary",
                    }}
                  >
                    {task.text}
                  </Typography>

                  <IconButton color="primary" onClick={() => startEdit(task)}>
                    <EditIcon />
                  </IconButton>

                  <IconButton color="error" onClick={() => setDeleteId(task._id)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              )}
            </CardContent>
          </Card>
        );
      })}

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Delete this task?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This action can&apos;t be undone. The task will be permanently removed.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)} color="inherit">
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              delTask(deleteId);
              setDeleteId(null);
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}