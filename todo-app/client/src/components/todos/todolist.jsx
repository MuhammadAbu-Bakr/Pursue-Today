import TodoForm from "./todoForm.jsx";
import TodoItem from "./todoItem.jsx";
import AccountBar from "../auth/AccountBar.jsx";

import {
  Container,
  Paper,
  Typography,
  Box,
} from "@mui/material";

function Todolist() {
  return (
    <Container maxWidth="md" sx={{ mt: 5 }}>
      <Paper
        elevation={6}
        sx={{
          p: 4,
          borderRadius: 4,
        }}
      >
        <AccountBar />

        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography
            variant="h3"
            component="h1"
            fontWeight="bold"
          >
            📝 To-Do List
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mt: 1 }}
          >
            Organize your tasks and stay productive.
          </Typography>
        </Box>

        <TodoForm />

        <Box sx={{ mt: 3 }}>
          <TodoItem />
        </Box>
      </Paper>
    </Container>
  );
}

export default Todolist;