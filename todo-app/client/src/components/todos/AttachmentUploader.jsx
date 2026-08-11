import { useRef, useState } from "react";
import {
  Box,
  Button,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CloseIcon from "@mui/icons-material/Close";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";

const MAX_FILE_SIZE_KB = 1000;
const MAX_FILES_PER_TASK = 5;
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);
const ACCEPT = ".jpg,.jpeg,.png,.webp,.gif,.pdf,.doc,.docx,.txt";

export default function AttachmentUploader({
  pendingFiles = [],
  onFilesChange,
  existingCount = 0,
  disabled = false,
}) {
  const inputRef = useRef(null);
  const [errors, setErrors] = useState([]);

  const remaining = MAX_FILES_PER_TASK - existingCount - pendingFiles.length;

  function handleFileSelect(e) {
    const chosen = Array.from(e.target.files);
    const valid = [];
    const errs = [];

    for (const file of chosen) {
      if (!ALLOWED_MIME_TYPES.has(file.type)) {
        errs.push(`"${file.name}": file type not supported.`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE_KB * 1024) {
        errs.push(`"${file.name}": exceeds ${MAX_FILE_SIZE_KB} KB limit.`);
        continue;
      }
      if (pendingFiles.length + valid.length >= remaining) {
        errs.push(`Max ${MAX_FILES_PER_TASK} attachments per task.`);
        break;
      }
      valid.push(file);
    }

    const updated = [...pendingFiles, ...valid];
    setErrors(errs);
    onFilesChange?.(updated);
    e.target.value = "";
  }

  function removeFile(index) {
    const updated = pendingFiles.filter((_, i) => i !== index);
    setErrors([]);
    onFilesChange?.(updated);
  }

  return (
    <Box>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPT}
        style={{ display: "none" }}
        onChange={handleFileSelect}
      />

      <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
        <Button
          variant="outlined"
          size="small"
          startIcon={<AttachFileIcon />}
          onClick={() => inputRef.current?.click()}
          disabled={disabled || remaining <= 0}
        >
          Attach Files
        </Button>
      </Stack>

      {errors.length > 0 && (
        <Stack spacing={0.25} sx={{ mt: 0.75 }}>
          {errors.map((err, i) => (
            <Typography key={i} variant="caption" color="error">
              {err}
            </Typography>
          ))}
        </Stack>
      )}

      {pendingFiles.length > 0 && (
        <Stack spacing={0.5} sx={{ mt: 1 }}>
          {pendingFiles.map((file, i) => {
            const isImage = file.type.startsWith("image/");
            const previewUrl = isImage ? URL.createObjectURL(file) : null;
            return (
              <Box
                key={i}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  p: 0.5,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  maxWidth: "100%",
                  overflow: "hidden",
                }}
              >
                {isImage ? (
                  <img
                    src={previewUrl}
                    alt={file.name}
                    style={{
                      width: 36,
                      height: 36,
                      objectFit: "cover",
                      borderRadius: 4,
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <InsertDriveFileIcon
                    fontSize="small"
                    color="action"
                    sx={{ flexShrink: 0 }}
                  />
                )}
                <Typography
                  variant="caption"
                  sx={{
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {file.name}{" "}
                  <Typography component="span" variant="caption" color="text.secondary">
                    ({(file.size / 1024).toFixed(1)} KB)
                  </Typography>
                </Typography>
                <IconButton size="small" onClick={() => removeFile(i)} aria-label="Remove pending file">
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}
