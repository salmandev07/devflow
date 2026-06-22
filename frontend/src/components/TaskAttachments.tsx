import { useEffect, useState } from "react";
import { Paperclip, Upload, Trash2, FileText, Image, File } from "lucide-react";
import { getAttachments, uploadAttachment, deleteAttachment } from "../services/attachmentService";
import { useToast } from "../hooks/useToast";
import Avatar from "./Avatar";
import ConfirmDialog from "./ConfirmDialog";

type Props = { taskId: number };

type Attachment = {
  id: number;
  file: string;
  uploaded_by_username: string;
};

function getFileIcon(url: string) {
  const ext = url.split(".").pop()?.toLowerCase() ?? "";
  if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext)) return <Image size={16} className="text-emerald-400" />;
  if (["pdf", "doc", "docx", "txt", "md"].includes(ext)) return <FileText size={16} className="text-amber-400" />;
  return <File size={16} className="text-slate-600 dark:text-slate-400" />;
}

function getFileName(url: string) {
  return url.split("/").pop() || url;
}

export default function TaskAttachments({ taskId }: Props) {
  const { addToast } = useToast();
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try { setAttachments(await getAttachments(taskId)); }
      catch (err) { console.error(err); addToast("error", "Failed to load attachments"); }
      finally { setLoading(false); }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]);

  const loadAttachments = async () => {
    try { setAttachments(await getAttachments(taskId)); }
    catch (err) { console.error(err); addToast("error", "Failed to load attachments"); }
  };

  const handleUpload = async () => {
    if (!file || uploading) return;
    setUploading(true);
    try {
      await uploadAttachment(taskId, file);
      setFile(null);
      await loadAttachments();
    } catch (err) { console.error(err); addToast("error", "Failed to upload attachment"); }
    finally { setUploading(false); }
  };

  const handleDeleteConfirm = async () => {
    if (confirmDeleteId === null) return;
    setDeleting(true);
    try {
      await deleteAttachment(confirmDeleteId);
      setAttachments((prev) => prev.filter((a) => a.id !== confirmDeleteId));
    } catch (err) { console.error(err); addToast("error", "Failed to delete attachment"); }
    finally { setDeleting(false); setConfirmDeleteId(null); }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };

  return (
    <div className="mt-8">
      {/* Section header */}
      <div className="flex items-center gap-2 mb-5">
        <Paperclip size={18} className="text-indigo-400" />
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Attachments</h2>
        {attachments.length > 0 && (
          <span className="ml-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-indigo-500/15 px-1.5 text-xs font-medium text-indigo-400">
            {attachments.length}
          </span>
        )}
      </div>

      {/* Upload zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`
          relative mb-5 rounded-xl border-2 border-dashed p-6 text-center transition-all
          ${dragOver
            ? "border-indigo-500 bg-indigo-500/5"
            : "border-slate-300/60 dark:border-slate-700/60 hover:border-slate-400 dark:hover:border-slate-600"
          }
        `}
      >
        <Upload size={24} className={`mx-auto mb-2 ${dragOver ? "text-indigo-400" : "text-slate-500 dark:text-slate-400"}`} />

        {file ? (
          <div className="flex items-center justify-center gap-3">
            <span className="text-sm text-slate-800 dark:text-slate-200 truncate max-w-[200px]">{file.name}</span>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 disabled:opacity-50 transition-colors"
            >
              {uploading ? "Uploading…" : "Upload"}
            </button>
            <button onClick={() => setFile(null)} className="text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-sm">Cancel</button>
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-500 dark:text-slate-500">Drag & drop a file here, or</p>
            <label className="mt-2 inline-block cursor-pointer text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
              browse files
              <input
                type="file"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </label>
          </>
        )}
      </div>

      {/* Attachment list */}
      {loading ? (
        <div className="space-y-2">
          {[1,2,3].map((i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 px-4 py-3">
              <div className="skeleton h-5 w-5 shrink-0" />
              <div className="skeleton h-3 w-full" />
            </div>
          ))}
        </div>
      ) : attachments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
          <Paperclip size={28} className="text-slate-400 dark:text-slate-500 mb-2" />
          <p className="text-sm text-slate-500 dark:text-slate-500">No attachments yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {attachments.map((a) => (
            <div
              key={a.id}
              className="group flex items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 px-4 py-3 transition-all hover:border-slate-300 dark:hover:border-slate-700"
            >
              <div className="flex items-center gap-3 min-w-0">
                {getFileIcon(a.file)}
                <a
                  href={a.file}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium text-slate-800 dark:text-slate-200 hover:text-indigo-400 truncate transition-colors"
                >
                  {getFileName(a.file)}
                </a>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-1.5">
                  <Avatar name={a.uploaded_by_username} size="xs" />
                  <span className="text-xs text-slate-500 dark:text-slate-500">{a.uploaded_by_username}</span>
                </div>
                <button
                  onClick={() => setConfirmDeleteId(a.id)}
                  disabled={deleting && confirmDeleteId === a.id}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-500 dark:text-slate-500 hover:text-rose-400 transition-all disabled:opacity-50"
                >
                  {deleting && confirmDeleteId === a.id ? (
                    <span className="block h-3.5 w-3.5 animate-spin rounded-full border-2 border-rose-400 border-t-transparent" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={confirmDeleteId !== null}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Attachment"
        message="Are you sure you want to delete this attachment? This action cannot be undone."
        confirmLabel="Delete"
        loading={deleting}
      />
    </div>
  );
}