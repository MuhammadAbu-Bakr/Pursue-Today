import { useEffect, useState } from "react";
import { Box, Typography, Button, LinearProgress } from "@mui/material";
import { useAuth, API_BASE } from "../../context/auth-context.jsx";

export default function AccountBar() {
  const { user, logout } = useAuth();
  const [usage, setUsage] = useState(null);

  useEffect(() => {
    if (!user) return;
    fetch(`${API_BASE}/usage`, { credentials: "include" })
      .then((r) => r.json())
      .then(setUsage)
      .catch(() => {});
  }, [user]);

  if (!user) return null;

  const percent = usage ? Math.min(100, (usage.usedBytes / usage.maxBytes) * 100) : 0;
  const usedMB = usage ? (usage.usedBytes / (1024 * 1024)).toFixed(2) : "—";
  const maxMB = usage ? (usage.maxBytes / (1024 * 1024)).toFixed(0) : "30";

  return (
    <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
      <Box flex={1} mr={2}>
        <Typography variant="body2" color="text.secondary">
          {user.name} ({user.email}) — {usedMB} / {maxMB} MB used
        </Typography>
        <LinearProgress
          variant="determinate"
          value={percent}
          color={percent > 90 ? "error" : "primary"}
          sx={{ mt: 0.5, borderRadius: 1 }}
        />
      </Box>
      <Button size="small" onClick={logout}>Log out</Button>
    </Box>
  );
}
