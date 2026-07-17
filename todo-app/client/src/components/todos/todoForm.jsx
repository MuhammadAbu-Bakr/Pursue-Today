import { Paper, TextField, Button, Stack, CircularProgress } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useTodo } from "../../context/todo-context.jsx";

export default function TodoForm() {
  const {
    newTask,
    handleInputChange,
    handleKeyDown,
    addTask,
    isAdding,
  } = useTodo();

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
            variant="outlined"
          />

          <Button
            type="submit"
            variant="contained"
            startIcon={isAdding ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
            size="large"
            disabled={isAdding}
            sx={{
              alignSelf: "flex-end",
              borderRadius: 2,
              textTransform: "none",
              px: 3,
            }}
          >
            {isAdding ? "Adding..." : "Add Task"}
          </Button>
        </Stack>
      </form>
    </Paper>
  );
}