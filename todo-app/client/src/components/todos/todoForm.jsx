import { Paper, TextField, Button, Stack } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useTodo } from "../../context/todo-context.jsx";

export default function TodoForm() {
  const {
    newTask,
    handleInputChange,
    handleKeyDown,
    addTask,
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
            startIcon={<AddIcon />}
            size="large"
            sx={{
              alignSelf: "flex-end",
              borderRadius: 2,
              textTransform: "none",
              px: 3,
            }}
          >
            Add Task
          </Button>
        </Stack>
      </form>
    </Paper>
  );
}