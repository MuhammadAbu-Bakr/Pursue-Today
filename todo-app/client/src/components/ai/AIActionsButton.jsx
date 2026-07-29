import { useState } from "react";
import { Button, Menu, MenuItem, CircularProgress } from "@mui/material";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";

import { AI_ACTIONS } from "../../constants/aiActions";

export default function AIActionsButton({ isLoading, onSelect, disabled }) {
  const [menuAnchor, setMenuAnchor] = useState(null);

  function openMenu(e) {
    setMenuAnchor(e.currentTarget);
  }

  function closeMenu() {
    setMenuAnchor(null);
  }

  function handleSelect(action) {
    closeMenu();
    onSelect(action);
  }

  return (
    <>
      <Button
        variant="outlined"
        startIcon={
          isLoading ? (
            <CircularProgress size={18} color="inherit" />
          ) : (
            <AutoFixHighIcon />
          )
        }
        onClick={openMenu}
        disabled={disabled || isLoading}
      >
        {isLoading ? "Working..." : "AI Actions"}
      </Button>

      <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={closeMenu}>
        {AI_ACTIONS.map(({ action, label }) => (
          <MenuItem key={action} onClick={() => handleSelect(action)}>
            {label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}