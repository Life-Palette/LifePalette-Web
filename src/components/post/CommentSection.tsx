import { motion } from "framer-motion";
import { ChevronDown, MessageCircle, Reply, Send, Trash2 } from "lucide-react";
import { useState } from "react";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useIsAuthenticated } from "@/hooks/useAuth";
import { useCommentReplies, useDeleteComment } from "@/hooks/useTopicDetail";
import { formatRelativeTime } from "@/utils/date";

interface CommentUser {
  id: number;
  name: string;
  username?: string;
  avatarInfo?: {
    url: string;
  };
}

interface CommentReply {
  id: number;
  content: string;
  userId: number;
  createdAt: string;
  user: CommentUser;
}

interface Comment {
  id: number;
  content: string;
  userId: number;
  topicId: number;
  createdAt: string;
  user: CommentUser;
  replies?: CommentReply[];
  repliesCount?: number;
}

interface CommentSectionProps {
  topicId: number;
  comments: Comment[];
  isLoading: boolean;
  onCreateComment: (content: string) => Promise<void>;
  onCreateReply: (commentId: number, content: string, replyToUserId?: number) => Promise<void>;
}

// 回复项组件
function ReplyItem({
  reply,
  replyIdx,
  currentUserId,
  onDelete,
}: {
  reply: any;
  replyIdx: number;
  currentUserId?: number;
  onDelete: () => void;
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const deleteCommentMutation = useDeleteComment();
  const isOwnReply = currentUserId === reply.userId;

  const handleDeleteReply = async () => {
    try {
      await deleteCommentMutation.mutateAsync(reply.id);
      onDelete();
    } catch (error) {
      console.error("删除回复失败:", error);
    }
  };

  return (
    <motion.div
      animate={{ opacity: 1, x: 0 }}
      className="group flex gap-2.5 py-2"
      initial={{ opacity: 0, x: -10 }}
      transition={{ delay: replyIdx * 0.03 }}
    >
      <Avatar className="h-6 w-6 flex-shrink-0 rounded-full">
        <AvatarImage alt={reply.user?.name} src={reply.user?.avatarInfo?.url} />
        <AvatarFallback className="bg-gray-200 text-gray-600 text-[10px]">
          {reply.user?.name?.charAt(0)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <span className="font-medium text-gray-900 text-xs">{reply.user?.name}</span>
          <span className="text-gray-400 text-[11px]">{formatRelativeTime(reply.createdAt)}</span>
          {isOwnReply && (
            <>
              <button
                className="h-5 w-5 p-0 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 size={12} />
              </button>
              <ConfirmDialog
                confirmText="删除"
                description="删除后将无法恢复"
                onConfirm={handleDeleteReply}
                onOpenChange={setShowDeleteConfirm}
                open={showDeleteConfirm}
                title="确定要删除这条回复吗？"
                variant="destructive"
              />
            </>
          )}
        </div>
        <p className="break-words text-gray-700 text-xs leading-relaxed">{reply.content}</p>
      </div>
    </motion.div>
  );
}

// 单个评论项组件
function CommentItem({
  comment,
  idx,
  isAuthenticated,
  currentUserId,
  onCreateReply,
}: {
  comment: Comment;
  idx: number;
  isAuthenticated: boolean;
  currentUserId?: number;
  onCreateReply: (commentId: number, content: string, replyToUserId?: number) => Promise<void>;
}) {
  const [replyingTo, setReplyingTo] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const {
    data: replies,
    isLoading: repliesLoading,
    refetch: refetchReplies,
  } = useCommentReplies(comment.id, isExpanded);

  const deleteCommentMutation = useDeleteComment();
  const isOwnComment = currentUserId === comment.userId;

  const handleSubmitReply = async () => {
    if (!replyText.trim() || !isAuthenticated) return;

    setIsSubmitting(true);
    try {
      await onCreateReply(comment.id, replyText.trim(), comment.userId);
      setReplyText("");
      setReplyingTo(false);
      refetchReplies();
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleReplies = () => {
    setIsExpanded(!isExpanded);
  };

  const handleDeleteComment = async () => {
    try {
      await deleteCommentMutation.mutateAsync(comment.id);
    } catch (error) {
      console.error("删除评论失败:", error);
    }
  };

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="group border-b border-gray-100 py-4 last:border-0"
      initial={{ opacity: 0, y: 10 }}
      transition={{ delay: idx * 0.05 }}
    >
      <div className="flex gap-3">
        <Avatar className="h-8 w-8 flex-shrink-0 rounded-full">
          <AvatarImage alt={comment.user?.name} src={comment.user?.avatarInfo?.url} />
          <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
            {comment.user?.name?.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900 text-sm">{comment.user?.name}</span>
              <span className="text-gray-400 text-xs">{formatRelativeTime(comment.createdAt)}</span>
            </div>

            {isOwnComment && (
              <>
                <Button
                  className="h-6 w-6 p-0 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 size={14} />
                </Button>
                <ConfirmDialog
                  confirmText="删除"
                  description="删除后将无法恢复"
                  onConfirm={handleDeleteComment}
                  onOpenChange={setShowDeleteConfirm}
                  open={showDeleteConfirm}
                  title="确定要删除这条评论吗？"
                  variant="destructive"
                />
              </>
            )}
          </div>
          <p className="mb-2 break-words text-gray-700 text-sm leading-relaxed">
            {comment.content}
          </p>

          <div className="flex items-center gap-2">
            {comment.repliesCount && comment.repliesCount > 0 ? (
              <Button className="h-auto p-0 text-xs" onClick={toggleReplies} variant="ghost">
                <motion.div
                  animate={{
                    rotate: isExpanded ? 180 : 0,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown size={12} />
                </motion.div>
                <span className="ml-1">{comment.repliesCount} 条回复</span>
              </Button>
            ) : null}

            {isAuthenticated && (
              <Button
                className="h-auto p-0 text-xs"
                onClick={() => {
                  setReplyingTo(!replyingTo);
                  setReplyText("");
                }}
                variant="ghost"
              >
                <Reply size={12} />
                <span className="ml-1">回复</span>
              </Button>
            )}
          </div>

          {replyingTo && (
            <motion.div
              animate={{ opacity: 1, height: "auto" }}
              className="mt-2.5 space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-3"
              initial={{ opacity: 0, height: 0 }}
            >
              <Textarea
                className="min-h-[50px] resize-none border-0 bg-white text-sm focus-visible:ring-1 focus-visible:ring-gray-300"
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    handleSubmitReply();
                  }
                }}
                placeholder={`回复 @${comment.user?.name}`}
                value={replyText}
              />
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-[11px]">{replyText.length}/1000</span>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setReplyingTo(false);
                      setReplyText("");
                    }}
                    size="sm"
                    variant="ghost"
                  >
                    取消
                  </Button>
                  <Button
                    disabled={!replyText.trim() || isSubmitting}
                    onClick={handleSubmitReply}
                    size="sm"
                  >
                    {isSubmitting ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <>
                        <Send size={11} className="mr-1" />
                        发送
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {isExpanded && (
            <motion.div
              animate={{ opacity: 1, height: "auto" }}
              className="mt-3 overflow-hidden rounded-lg bg-muted/20 px-3"
              initial={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              {repliesLoading ? (
                <div className="py-6 text-center">
                  <LoadingSpinner size="sm" />
                </div>
              ) : replies && replies.length > 0 ? (
                <div className="divide-y divide-border/30">
                  {replies.map((reply: any, replyIdx: number) => (
                    <ReplyItem
                      currentUserId={currentUserId}
                      key={reply.id}
                      onDelete={refetchReplies}
                      reply={reply}
                      replyIdx={replyIdx}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center">
                  <p className="text-muted-foreground/60 text-xs">暂无回复</p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function CommentSection({
  comments,
  isLoading,
  onCreateComment,
  onCreateReply,
}: CommentSectionProps) {
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAuthenticated, user } = useIsAuthenticated();

  const handleSubmitComment = async () => {
    if (!commentText.trim() || !isAuthenticated) return;

    setIsSubmitting(true);
    try {
      await onCreateComment(commentText.trim());
      setCommentText("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-6">
      <div className="border-t border-gray-200 pt-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-black text-lg">
            评论 <span className="text-gray-500 text-base ml-2">{comments?.length || 0}</span>
          </h3>
          <div className="flex gap-1">
            <div className="w-8 h-[1px] bg-black" />
            <div className="w-3 h-[1px] bg-gray-400" />
            <div className="w-1 h-[1px] bg-gray-300" />
          </div>
        </div>
      </div>

      {isAuthenticated ? (
        <div className="space-y-3 border border-gray-200 bg-white rounded-lg p-3.5">
          <Textarea
            className="min-h-[70px] resize-none border-0 bg-transparent text-black text-sm placeholder:text-gray-400 focus:outline-none focus-visible:ring-0"
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleSubmitComment();
              }
            }}
            placeholder="添加评论..."
            value={commentText}
          />
          <div className="flex items-center justify-between border-t border-gray-100 pt-3">
            <span className="font-mono text-gray-400 text-xs">{commentText.length}/1000</span>
            <Button
              disabled={!commentText.trim() || isSubmitting}
              onClick={handleSubmitComment}
              size="sm"
            >
              {isSubmitting ? <LoadingSpinner size="sm" /> : "发布"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="border border-gray-200 bg-gray-50 rounded-lg py-12 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 border border-gray-300 bg-white rounded-full mb-3">
            <MessageCircle className="text-gray-400" size={20} strokeWidth={1.5} />
          </div>
          <p className="text-gray-600 text-sm font-light">登录后参与讨论</p>
        </div>
      )}

      <div>
        {isLoading ? (
          <div className="py-12 text-center">
            <LoadingSpinner className="mb-2" size="md" />
          </div>
        ) : comments && comments.length > 0 ? (
          <div className="space-y-0">
            {comments.map((comment, idx) => (
              <CommentItem
                comment={comment}
                currentUserId={user?.id}
                idx={idx}
                isAuthenticated={isAuthenticated}
                key={comment.id}
                onCreateReply={onCreateReply}
              />
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-gray-200 bg-gray-50 rounded-lg py-12 text-center">
            <div className="text-gray-300 text-3xl mb-2 font-semibold">0</div>
            <p className="text-gray-500 text-sm font-light">暂无评论</p>
            <p className="mt-1 text-gray-400 text-xs">成为第一个分享想法的人</p>
          </div>
        )}
      </div>
    </div>
  );
}
