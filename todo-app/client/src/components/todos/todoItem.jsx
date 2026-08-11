import { useState, useRef, useEffect } from "react";
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
  Alert,
} from "@mui/material";

import EditIcon    from "@mui/icons-material/Edit";
import DeleteIcon  from "@mui/icons-material/Delete";
import SaveIcon    from "@mui/icons-material/Save";
import CloseIcon   from "@mui/icons-material/Close";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";

import { useTodo }         from "../../context/todo-context.jsx";
import AIActionsButton     from "../ai/AIActionsButton.jsx";
import AttachmentUploader  from "./AttachmentUploader.jsx";
import AttachmentList      from "./AttachmentList.jsx";

function priorityColor(p) {
  if (p === "High")   return "error";
  if (p === "Medium") return "warning";
  return "success";
}

function SingleTask({ task, onRequestDelete }) {
  const {
    editingId,
    editText,
    togglingId,
    fixingId,
    toggleTask,
    startEdit,
    handleEditChange,
    cancelEdit,
    saveEdit,
    applyEditAction,
    editDueDate,   setEditDueDate,
    editPriority,  setEditPriority,
    editCategory,  setEditCategory,
    editTags,      setEditTags,
    uploadAttachments,
    deleteAttachment,
  } = useTodo();

  const isEditing     = editingId === task._id;
  const isFixingThis  = fixingId  === task._id;
  const isToggling    = togglingId === task._id;

  const [viewOpen,      setViewOpen]      = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const descRef = useRef(null);

  const [pendingEditFiles, setPendingEditFiles] = useState([]);
  const [uploadError,      setUploadError]      = useState("");
  const [isUploading,      setIsUploading]      = useState(false);

  useEffect(() => {
    const el = descRef.current;
    if (!el) return;

    function check() {
      setIsOverflowing(el.scrollHeight > el.clientHeight + 2);
    }

    check();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [task.text]);

  useEffect(() => {
    if (!isEditing) {
      setPendingEditFiles([]);
      setUploadError("");
    }
  }, [isEditing]);

  async function handleAction(action) {
    if (!editText.trim()) return;
    try { await applyEditAction(action); } catch (err) { console.error(err); }
  }

  async function handleSave() {
    try {
      await saveEdit(task._id);

      if (pendingEditFiles.length > 0) {
        setIsUploading(true);
        setUploadError("");
        await uploadAttachments(task._id, pendingEditFiles);
        setPendingEditFiles([]);
      }
    } catch (err) {
      setUploadError(err.message || "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }

  const now   = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const due   = task.dueDate ? new Date(task.dueDate) : null;
  const dueDay = due ? new Date(due.getFullYear(), due.getMonth(), due.getDate()) : null;
  const isOverdue   = due && !task.completed && dueDay < today;
  const isDueToday  = due && !task.completed && dueDay?.getTime() === today.getTime();

  return (
    <>
      <Card elevation={3} sx={{ borderRadius: 3 }}>
        <CardContent>
          {isEditing ? (
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
                    sx={{ display: "block", mb: 0.5 }}
                  >
                    Due Date
                  </Typography>
                  <TextField
                    type="datetime-local"
                    fullWidth
                    size="small"
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} md={7}>
                  <FormControl fullWidth sx={{ minWidth: 220 }}>
                    <InputLabel id="edit-priority-label">Priority</InputLabel>
                    <Select
                      labelId="edit-priority-label"
                      value={editPriority}
                      label="Priority"
                      onChange={(e) => setEditPriority(e.target.value)}
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
                    fullWidth
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Tags"
                    fullWidth
                    value={editTags}
                    onChange={(e) => setEditTags(e.target.value)}
                  />
                </Grid>

                {task.attachments?.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                      Current Attachments
                    </Typography>
                    <AttachmentList
                      attachments={task.attachments}
                      taskId={task._id}
                      onDelete={deleteAttachment}
                    />
                  </Grid>
                )}

                <Grid item xs={12}>
                  <AttachmentUploader
                    pendingFiles={pendingEditFiles}
                    onFilesChange={setPendingEditFiles}
                    existingCount={task.attachments?.length || 0}
                    disabled={isUploading}
                  />
                </Grid>
              </Grid>

              {uploadError && (
                <Alert severity="error" onClose={() => setUploadError("")}>
                  {uploadError}
                </Alert>
              )}

              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, flexWrap: "wrap" }}>
                <AIActionsButton isLoading={isFixingThis} onSelect={handleAction} />

                <Button
                  variant="outlined"
                  color="inherit"
                  startIcon={<CloseIcon />}
                  onClick={cancelEdit}
                  disabled={isUploading}
                >
                  Cancel
                </Button>

                <Button
                  variant="contained"
                  startIcon={
                    isUploading
                      ? <CircularProgress size={16} color="inherit" />
                      : <SaveIcon />
                  }
                  onClick={handleSave}
                  disabled={isUploading}
                >
                  {isUploading ? "Uploading…" : "Save"}
                </Button>
              </Box>
            </Stack>

          ) : (
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 42,
                  height: 42,
                  flexShrink: 0,
                  mt: 0.25,
                }}
              >
                {isToggling ? (
                  <CircularProgress size={24} />
                ) : (
                  <Checkbox
                    checked={task.completed}
                    onChange={() => toggleTask(task._id)}
                  />
                )}
              </Box>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  ref={descRef}
                  sx={{
                    wordBreak: "break-word",
                    overflowWrap: "anywhere",
                    whiteSpace: "pre-wrap",
                    textDecoration: task.completed ? "line-through" : "none",
                    color: task.completed ? "text.secondary" : "text.primary",
                    display: "-webkit-box",
                    WebkitLineClamp: 4,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {task.text}
                </Typography>

                {isOverflowing && (
                  <Button
                    size="small"
                    variant="text"
                    startIcon={<OpenInFullIcon fontSize="small" />}
                    onClick={() => setViewOpen(true)}
                    sx={{ mt: 0.5, px: 0, textTransform: "none" }}
                  >
                    View full description
                  </Button>
                )}

                <Stack
                  direction="row"
                  sx={{ mt: 1, flexWrap: "wrap", gap: 1 }}
                >
                  {task.priority && (
                    <Chip
                      label={task.priority}
                      size="small"
                      color={priorityColor(task.priority)}
                      sx={{ minWidth: 90, justifyContent: "center", fontWeight: 600 }}
                    />
                  )}

                  {task.category && (
                    <Chip label={task.category} size="small" color="primary" variant="outlined" />
                  )}

                  {task.tags?.map((tag) => (
                    <Chip key={tag} label={tag} size="small" variant="outlined" />
                  ))}

                  {task.dueDate && (
                    <Chip
                      label={new Date(task.dueDate).toLocaleString()}
                      size="small"
                    />
                  )}

                  {isOverdue && (
                    <Chip label="Overdue" size="small" color="error" />
                  )}

                  {!isOverdue && isDueToday && (
                    <Chip label="Due Today" size="small" color="warning" />
                  )}
                </Stack>

                <AttachmentList
                  attachments={task.attachments}
                  taskId={task._id}
                  onDelete={deleteAttachment}
                />
              </Box>

              <Stack direction={{ xs: "column", sm: "row" }} sx={{ flexShrink: 0 }}>
                <IconButton color="primary" onClick={() => startEdit(task)} aria-label="Edit task">
                  <EditIcon />
                </IconButton>
                <IconButton color="error" onClick={() => onRequestDelete(task._id)} aria-label="Delete task">
                  <DeleteIcon />
                </IconButton>
              </Stack>
            </Box>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        maxWidth="sm"
        fullWidth
        aria-labelledby={`view-desc-title-${task._id}`}
      >
        <DialogTitle id={`view-desc-title-${task._id}`} sx={{ pr: 6 }}>
          Task Description
          <IconButton
            aria-label="Close description"
            onClick={() => setViewOpen(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Typography
            component="pre"
            sx={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              overflowWrap: "anywhere",
              fontFamily: "inherit",
              fontSize: "inherit",
              m: 0,
            }}
          >
            {task.text}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewOpen(false)} startIcon={<CloseIcon />}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default function TodoItem() {
  const [deleteId, setDeleteId] = useState(null);

  const {
    tasks,
    filteredTasks,
    loading,
    error,
    delTask,
  } = useTodo();

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px", width: "100%" }}>
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
      {filteredTasks.map((task) => (
        <SingleTask
          key={task._id}
          task={task}
          onRequestDelete={setDeleteId}
        />
      ))}

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Delete this task?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This action can&apos;t be undone. The task and all its attachments will
            be permanently removed.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)} color="inherit">
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => { delTask(deleteId); setDeleteId(null); }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}