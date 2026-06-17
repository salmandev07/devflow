import { useEffect, useState } from "react";

import {
  getComments,
  createComment,
  deleteComment,
} from "../services/commentService";

type Props = {
  taskId: number;
};

type Comment = {
  id: number;
  username: string;
  content: string;
  created_at: string;
};

function TaskComments({
  taskId,
}: Props) {
  const [comments, setComments] =
    useState<Comment[]>([]);

  const [content, setContent] =
    useState("");

  const loadComments = async () => {
    try {
      const data = await getComments(
        taskId
      );

      setComments(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    void loadComments();
  }, [taskId]);

  const handleAddComment =
    async () => {
      if (!content.trim()) return;

      try {
        await createComment(
          taskId,
          content
        );

        setContent("");

        await loadComments();
      } catch (error) {
        console.error(error);
      }
    };

  const handleDeleteComment =
    async (id: number) => {
      try {
        await deleteComment(id);

        await loadComments();
      } catch (error) {
        console.error(error);
      }
    };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold text-white mb-4">
        Comments
      </h2>

      <textarea
        value={content}
        onChange={(e) =>
          setContent(
            e.target.value
          )
        }
        placeholder="Write a comment..."
        className="
          w-full
          rounded-xl
          bg-slate-800
          p-3
          text-white
        "
      />

      <button
        onClick={
          handleAddComment
        }
        className="
          mt-3
          rounded-xl
          bg-blue-600
          px-4
          py-2
          text-white
        "
      >
        Add Comment
      </button>

      <div className="mt-6 space-y-4">
        {comments.map(
          (comment) => (
            <div
              key={comment.id}
              className="
                rounded-xl
                bg-slate-900
                p-4
              "
            >
              <p className="text-blue-400">
                {
                  comment.username
                }
              </p>

              <p className="text-white mt-2">
                {
                  comment.content
                }
              </p>

              <button
                onClick={() =>
                  handleDeleteComment(
                    comment.id
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

export default TaskComments;