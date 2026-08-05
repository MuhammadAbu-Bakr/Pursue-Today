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
  Chip,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
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
    editDueDate,
    setEditDueDate,
    editPriority,
    setEditPriority,
    editCategory,
    setEditCategory,
    editTags,
    setEditTags,
  } = useTodo();

  async function handleAction(action) {
    if (!editText.trim()) return;

    try {
      await applyEditAction(action);
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "200px",
          width: "100%",
        }}
      >
        <CircularProgress />
      </Box>
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

        const now = new Date();

        const today = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );

        const due = task.dueDate ? new Date(task.dueDate) : null;

        const dueDay = due
          ? new Date(
              due.getFullYear(),
              due.getMonth(),
              due.getDate()
            )
          : null;

        const isDueToday =
          due &&
          !task.completed &&
          dueDay.getTime() === today.getTime();

        const isOverdue =
          due &&
          !task.completed &&
          dueDay < today;

        return (
          <Card
            key={task._id}
            elevation={3}
            sx={{ borderRadius: 3 }}
          >
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

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={5}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          display: "block",
                          mb: 0.5,
                        }}
                      >
                        Due Date
                      </Typography>

                      <TextField
                        type="datetime-local"
                        fullWidth
                        size="small"
                        value={editDueDate}
                        onChange={(e) =>
                          setEditDueDate(e.target.value)
                        }
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} md={7}>
                      <FormControl
                        fullWidth
                        sx={{
                          minWidth: 220,
                        }}
                      >
                        <InputLabel id="edit-priority-label">
                          Priority
                        </InputLabel>

                        <Select
                          labelId="edit-priority-label"
                          value={editPriority}
                          label="Priority"
                          onChange={(e) => setEditPriority(e.target.value)}
                          sx={{
                            width: "100%",
                          }}
                        >
                          <MenuItem value="">
                            <em>None</em>
                          </MenuItem>

                          <MenuItem value="Low">
                            Low
                          </MenuItem>

                          <MenuItem value="Medium">
                            Medium
                          </MenuItem>

                          <MenuItem value="High">
                            High
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Category"
                        fullWidth
                        value={editCategory}
                        onChange={(e) =>
                          setEditCategory(e.target.value)
                        }
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Tags"
                        fullWidth
                        value={editTags}
                        onChange={(e) =>
                          setEditTags(e.target.value)
                        }
                      />
                    </Grid>
                  </Grid>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: 1,
                    }}
                  >
                    <AIActionsButton
                      isLoading={isFixingThis}
                      onSelect={handleAction}
                    />

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
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 42,
                      height: 42,
                    }}
                  >
                    {togglingId === task._id ? (
                      <CircularProgress size={24} />
                    ) : (
                      <Checkbox
                        checked={task.completed}
                        onChange={() =>
                          toggleTask(task._id)
                        }
                      />
                    )}
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      flexGrow: 1,
                    }}
                  >
                    <Typography
                      sx={{
                        wordBreak: "break-word",
                        textDecoration: task.completed
                          ? "line-through"
                          : "none",
                        color: task.completed
                          ? "text.secondary"
                          : "text.primary",
                      }}
                    >
                      {task.text}
                    </Typography>

                    <Stack
                      direction="row"
                      sx={{
                        mt: 1,
                        flexWrap: "wrap",
                        gap: 1,
                      }}
                    >
                                            {task.priority && (
                        <Chip
                          label={task.priority}
                          size="small"
                          color={
                            task.priority === "High"
                              ? "error"
                              : task.priority === "Medium"
                              ? "warning"
                              : "success"
                          }
                          sx={{
                            minWidth: 90,
                            justifyContent: "center",
                            fontWeight: 600,
                          }}
                        />
                      )}

                      {task.category && (
                        <Chip
                          label={task.category}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      )}

                      {task.tags &&
                        task.tags.map((tag) => (
                          <Chip
                            key={tag}
                            label={tag}
                            size="small"
                            variant="outlined"
                          />
                        ))}

                      {task.dueDate && (
                        <Chip
                          label={new Date(
                            task.dueDate
                          ).toLocaleString()}
                          size="small"
                        />
                      )}

                      {isOverdue && (
                        <Chip
                          label="Overdue"
                          size="small"
                          color="error"
                        />
                      )}

                      {!isOverdue && isDueToday && (
                        <Chip
                          label="Due Today"
                          size="small"
                          color="warning"
                        />
                      )}
                    </Stack>
                  </Box>

                  <IconButton
                    color="primary"
                    onClick={() => startEdit(task)}
                  >
                    <EditIcon />
                  </IconButton>

                  <IconButton
                    color="error"
                    onClick={() => setDeleteId(task._id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              )}
            </CardContent>
          </Card>
        );
      })}

      <Dialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
      >
        <DialogTitle>
          Delete this task?
        </DialogTitle>

        <DialogContent>
          <DialogContentText>
            This action can&apos;t be undone.
            The task will be permanently
            removed.
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => setDeleteId(null)}
            color="inherit"
          >
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