import TodoForm from "./todoForm.jsx";
import TodoItem from "./todoItem.jsx";
import AccountBar from "../auth/AccountBar.jsx";

import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { useTodo } from "../../context/todo-context.jsx";

function Todolist() {
  const {
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    filterCategory,
    setFilterCategory,
    filterTags,
    setFilterTags,
  } = useTodo();

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
          <Typography variant="h3" component="h1" fontWeight="bold">
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

        <Box
          sx={{
            display: "flex",
            gap: 2,
            mb: 3,
            flexDirection: { xs: "column", sm: "row" },
            flexWrap: "wrap",
          }}
        >
          <TextField
            label="Search Tasks"
            variant="outlined"
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <TextField
            label="Filter Category"
            variant="outlined"
            fullWidth
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          />

          <TextField
            label="Filter Tags"
            placeholder="comma separated"
            variant="outlined"
            fullWidth
            value={filterTags}
            onChange={(e) => setFilterTags(e.target.value)}
          />

          <FormControl
            sx={{
              minWidth: {
                xs: "100%",
                sm: 280,
              },
            }}
          >
            <InputLabel>Sort By</InputLabel>

            <Select
              value={sortBy}
              label="Sort By"
              onChange={(e) => setSortBy(e.target.value)}
            >
              <MenuItem value="newest">Newest First</MenuItem>
              <MenuItem value="oldest">Oldest First</MenuItem>
              <MenuItem value="completed">Completed First</MenuItem>
              <MenuItem value="uncompleted">Uncompleted First</MenuItem>
              <MenuItem value="soonest">Deadline: Soonest</MenuItem>
              <MenuItem value="latest">Deadline: Latest</MenuItem>
              <MenuItem value="priority-high-low">
                Priority: High to Low
              </MenuItem>
              <MenuItem value="priority-low-high">
                Priority: Low to High
              </MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ mt: 3 }}>
          <TodoItem />
        </Box>
      </Paper>
    </Container>
  );
}

export default Todolist;