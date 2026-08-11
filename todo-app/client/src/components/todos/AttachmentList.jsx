import { useState } from "react";
import {
  Box,
  Dialog,
  DialogContent,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ArticleIcon from "@mui/icons-material/Article";

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileIcon({ mimetype }) {
  if (mimetype === "application/pdf")
    return <PictureAsPdfIcon fontSize="small" color="error" sx={{ flexShrink: 0 }} />;
  if (
    mimetype === "application/msword" ||
    mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  )
    return <ArticleIcon fontSize="small" color="primary" sx={{ flexShrink: 0 }} />;
  return <InsertDriveFileIcon fontSize="small" color="action" sx={{ flexShrink: 0 }} />;
}

export default function AttachmentList({ attachments = [], taskId, onDelete }) {
  const [previewUrl, setPreviewUrl]   = useState(null);
  const [previewName, setPreviewName] = useState("");
  const [deleting, setDeleting]       = useState(null);

  if (!attachments || attachments.length === 0) return null;

  async function handleDelete(attachId) {
    if (!onDelete) return;
    setDeleting(attachId);
    try {
      await onDelete(taskId, attachId);
    } finally {
      setDeleting(null);
    }
  }

  function openPreview(url, name) {
    setPreviewUrl(url);
    setPreviewName(name);
  }

  return (
    <>
      <Stack
        direction="row"
        flexWrap="wrap"
        gap={1}
        sx={{ mt: 1 }}
      >
        {attachments.map((att) => {
          const isImage = att.mimetype?.startsWith("image/");
          const isBeingDeleted = deleting === att._id;

          return (
            <Box
              key={att._id}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.75,
                p: "4px 6px",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1.5,
                maxWidth: "100%",
                overflow: "hidden",
                opacity: isBeingDeleted ? 0.4 : 1,
                transition: "opacity 0.2s",
              }}
            >
              {isImage ? (
                <Tooltip title="Click to preview">
                  <img
                    src={att.url}
                    alt={att.filename}
                    style={{
                      width: 36,
                      height: 36,
                      objectFit: "cover",
                      borderRadius: 4,
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                    onClick={() => openPreview(att.url, att.filename)}
                  />
                </Tooltip>
              ) : (
                <FileIcon mimetype={att.mimetype} />
              )}

              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    maxWidth: 130,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {att.filename}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatBytes(att.size)}
                </Typography>
              </Box>

              <Tooltip title="Download">
                <IconButton
                  size="small"
                  component="a"
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={att.filename}
                  aria-label={`Download ${att.filename}`}
                >
                  <DownloadIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              <Tooltip title="Remove attachment">
                <span>
                  <IconButton
                    size="small"
                    color="error"
                    disabled={isBeingDeleted}
                    onClick={() => handleDelete(att._id)}
                    aria-label={`Remove ${att.filename}`}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          );
        })}
      </Stack>

      <Dialog
        open={!!previewUrl}
        onClose={() => setPreviewUrl(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent
          sx={{ p: 1, position: "relative", textAlign: "center", bgcolor: "black" }}
        >
          <IconButton
            onClick={() => setPreviewUrl(null)}
            aria-label="Close image preview"
            sx={{
              position: "absolute",
              top: 6,
              right: 6,
              zIndex: 1,
              bgcolor: "rgba(0,0,0,0.5)",
              color: "white",
              "&:hover": { bgcolor: "rgba(0,0,0,0.75)" },
            }}
          >
            <CloseIcon />
          </IconButton>
          {previewUrl && (
            <img
              src={previewUrl}
              alt={previewName}
              style={{
                maxWidth: "100%",
                maxHeight: "80vh",
                objectFit: "contain",
                display: "block",
                margin: "0 auto",
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
