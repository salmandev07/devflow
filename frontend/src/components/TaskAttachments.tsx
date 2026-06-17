import { useEffect, useState } from "react";

import {
  getAttachments,
  uploadAttachment,
  deleteAttachment,
} from "../services/attachmentService";

type Props = {
  taskId: number;
};

type Attachment = {
  id: number;
  file: string;
  uploaded_by_username: string;
};

function TaskAttachments({
  taskId,
}: Props) {
  const [attachments, setAttachments] =
    useState<Attachment[]>([]);

  const [file, setFile] =
    useState<File | null>(null);

  const loadAttachments =
    async () => {
      try {
        const data =
          await getAttachments(
            taskId
          );

        setAttachments(data);
      } catch (error) {
        console.error(error);
      }
    };

    useEffect(() => {
    const fetchAttachments = async () => {
        try {
        const data =
            await getAttachments(taskId);

        setAttachments(data);
        } catch (error) {
        console.error(error);
        }
    };

    void fetchAttachments();
    }, [taskId]);

  const handleUpload =
    async () => {
      if (!file) return;

      try {
        await uploadAttachment(
          taskId,
          file
        );

        setFile(null);

        await loadAttachments();
      } catch (error) {
        console.error(error);
      }
    };

  const handleDelete =
    async (id: number) => {
      try {
        await deleteAttachment(id);

        await loadAttachments();
      } catch (error) {
        console.error(error);
      }
    };

  return (
    <div className="mt-10">
      <h2 className="text-xl font-bold text-white mb-4">
        Attachments
      </h2>

      <input
        type="file"
        onChange={(e) =>
          setFile(
            e.target.files?.[0] ??
              null
          )
        }
        className="text-white"
      />

      <button
        onClick={handleUpload}
        className="
          ml-3
          rounded-xl
          bg-green-600
          px-4
          py-2
          text-white
        "
      >
        Upload
      </button>

      <div className="mt-6 space-y-3">
        {attachments.map(
          (attachment) => (
            <div
              key={attachment.id}
              className="
                rounded-xl
                bg-slate-900
                p-4
              "
            >
              <a
                href={
                  attachment.file
                }
                target="_blank"
                rel="noreferrer"
                className="
                  text-blue-400
                "
              >
                {
                  attachment.file
                }
              </a>

              <p className="text-slate-400">
                Uploaded by:
                {" "}
                {
                  attachment.uploaded_by_username
                }
              </p>

              <button
                onClick={() =>
                  handleDelete(
                    attachment.id
                  )
                }
                className="
                  mt-2
                  text-red-400
                "
              >
                Delete
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default TaskAttachments;