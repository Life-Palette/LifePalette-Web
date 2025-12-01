import { useForm } from "@tanstack/react-form";
import { Hash, Loader2 } from "lucide-react";
import type { Value } from "platejs";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { PlateEditor } from "@/components/editor/PlateEditor";
import { MediaUploader, type UnifiedMediaItem } from "@/components/media/MediaUploader";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { TagsInput } from "@/components/ui/tags-input";
import { useFileUpload } from "@/hooks/useFileUpload";
import { sanitizeHtml } from "@/lib/sanitize";
import { serializeToHtml } from "@/lib/serializeHtml";
import type { Post, PostImage } from "@/types";
import type { FileItem } from "@/types/upload";

type CreatePostModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    postData: Omit<
      Post,
      "id" | "author" | "likes" | "comments" | "saves" | "isLiked" | "isSaved" | "createdAt"
    >,
  ) => void;
  editMode?: boolean;
  topicId?: number;
  initialData?: {
    title: string;
    content: string;
    images?: PostImage[];
    topicTags?: Array<{
      tag: {
        title: string;
      };
    }>;
  };
};

// 初始空值
const initialValue: Value = [
  {
    type: "p",
    children: [{ text: "" }],
  },
];

// Zod schema for validation
const postSchema = z.object({
  title: z.string().min(1, "标题不能为空").max(100, "标题不能超过100个字符"),
  tags: z.string().optional(),
  location: z.string().optional(),
});

export default function CreatePostModal({
  isOpen,
  onClose,
  onSubmit,
  editMode = false,
  topicId: _topicId,
  initialData,
}: CreatePostModalProps) {
  const [content, setContent] = useState<Value>(initialValue);
  const [mediaItems, setMediaItems] = useState<UnifiedMediaItem[]>([]);

  // 使用文件上传 Hook
  const { uploadState, uploadMultipleFiles } = useFileUpload();

  const form = useForm({
    defaultValues: {
      title: "",
      tags: "",
      location: "",
    },
    onSubmit: async ({ value }) => {
      // 验证内容不为空
      if (isContentEmpty(content)) {
        toast.error("请输入内容");
        return;
      }

      try {
        // 1. 上传新文件
        const newItems = mediaItems.filter((item) => item.type === "new");
        let uploadedFiles: FileItem[] = [];

        if (newItems.length > 0) {
          const filesToUpload = newItems.map((item) => item.data.file);
          const rawUploadedFiles = await uploadMultipleFiles(filesToUpload, {
            compressPNG: false,
            compressJPEG: false,
          });

          // 处理 Live Photo 文件关联
          const { processLivePhotoFiles } = await import("../../utils/upload/fileProcessor");
          uploadedFiles = await processLivePhotoFiles(rawUploadedFiles);

          // 为有位置信息的文件更新位置（并行处理）
          const { apiService } = await import("@/services/api");
          const locationUpdatePromises = newItems
            .map((item, index) => {
              if (item.type === "new" && item.data.lat && item.data.lng) {
                const fileId = uploadedFiles[index].id;
                return apiService
                  .updateFileLocation(Number(fileId), {
                    lat: item.data.lat,
                    lng: item.data.lng,
                  })
                  .catch((error) => {
                    console.error(`更新文件 ${fileId} 位置失败:`, error);
                  });
              }
              return null;
            })
            .filter(Boolean);

          if (locationUpdatePromises.length > 0) {
            await Promise.all(locationUpdatePromises);
          }
        }

        // 2. 将 Plate Value 转换为 HTML 字符串
        const htmlContent = serializeToHtml(content);

        // 3. 清理 HTML 以防止 XSS 攻击
        const sanitizedContent = sanitizeHtml(htmlContent);

        // 4. 构建提交数据
        const postData: any = {
          title: value.title,
          content: sanitizedContent,
        };

        // 处理标签
        if (value.tags && value.tags.trim()) {
          postData.tags = value.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag.length > 0);
        }

        // 5. 按照 mediaItems 的顺序构建 fileIds
        const fileIds: number[] = [];
        let newFileIndex = 0;

        for (const item of mediaItems) {
          if (item.type === "existing") {
            fileIds.push(item.data.id);
          } else {
            fileIds.push(Number(uploadedFiles[newFileIndex].id));
            newFileIndex++;
          }
        }

        if (fileIds.length > 0) {
          postData.fileIds = fileIds.reverse();
        }

        // 6. 实际提交
        console.log(editMode ? "🔄-----更新数据-----" : "🍪-----创建数据-----", postData);
        onSubmit(postData);

        // 7. 重置表单（仅在创建模式）
        if (!editMode) {
          form.reset();
          setContent(initialValue);
          setMediaItems([]);
        }
        onClose();
      } catch (error) {
        console.error(editMode ? "更新失败:" : "提交失败:", error);
        toast.error(editMode ? "更新失败，请重试" : "提交失败，请重试");
      }
    },
  });

  // 编辑模式：加载初始数据
  useEffect(() => {
    if (isOpen && editMode && initialData) {
      form.setFieldValue("title", initialData.title || "");

      // 将 HTML 内容转换回 Plate Value
      if (initialData.content) {
        setContent([
          {
            type: "p",
            children: [{ text: initialData.content.replace(/<[^>]*>/g, "") }],
          },
        ]);
      }

      // 回显标签
      if (initialData.topicTags && initialData.topicTags.length > 0) {
        const tagNames = initialData.topicTags.map((tt) => tt.tag.title);
        form.setFieldValue("tags", tagNames.join(", "));
      } else {
        form.setFieldValue("tags", "");
      }
    } else if (isOpen && !editMode) {
      // 创建模式：重置表单
      form.reset();
      setContent(initialValue);
      setMediaItems([]);
    }
  }, [isOpen, editMode, initialData]);

  if (!isOpen) {
    return null;
  }

  // 检查内容是否为空
  const isContentEmpty = (value: Value) => {
    return value.every((node) => {
      if ("children" in node) {
        return node.children.every((child) => {
          if (typeof child === "object" && child !== null && "text" in child) {
            return typeof child.text === "string" && child.text.trim() === "";
          }
          return false;
        });
      }
      return false;
    });
  };

  return (
    <Dialog onOpenChange={(open) => !open && onClose()} open={isOpen}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-xl">{editMode ? "编辑动态" : "创建新动态"}</DialogTitle>
          <p className="mt-1 text-gray-500 text-sm">
            {editMode ? "修改你的动态内容" : "分享你的精彩瞬间"}
          </p>
        </DialogHeader>

        <form
          className="flex flex-1 flex-col overflow-hidden"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          {/* 可滚动内容区域 */}
          <div className="flex-1 space-y-4 overflow-y-auto px-6 pb-4">
            <FieldGroup>
              {/* 标题输入 */}
              <form.Field
                name="title"
                validators={{
                  onChange: ({ value }) => {
                    const result = postSchema.shape.title.safeParse(value);
                    if (!result.success) {
                      return result.error.issues[0].message;
                    }
                    return undefined;
                  },
                }}
              >
                {(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        标题 <span className="text-red-500">*</span>
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="给你的动态起个吸引人的标题..."
                        disabled={uploadState.isUploading}
                        aria-invalid={isInvalid}
                      />
                      {isInvalid && (
                        <FieldError
                          errors={field.state.meta.errors.map((err) => ({ message: err }))}
                        />
                      )}
                    </Field>
                  );
                }}
              </form.Field>

              {/* 内容输入 */}
              <div className="space-y-4">
                <div>
                  <label className="font-medium text-sm leading-none" htmlFor="post-content">
                    内容 <span className="text-red-500">*</span>
                  </label>
                </div>

                <PlateEditor
                  onChange={setContent}
                  placeholder="分享你的想法、感受或故事..."
                  value={content}
                />
              </div>

              {/* 媒体上传区域 */}
              <MediaUploader
                disabled={uploadState.isUploading}
                initialImages={initialData?.images}
                onChange={setMediaItems}
              />

              {/* 上传进度 */}
              {uploadState.isUploading && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Loader2 className="animate-spin text-blue-600" size={16} />
                      <span className="font-medium text-blue-900 text-sm">
                        {uploadState.stageText}
                      </span>
                    </div>
                    <span className="text-blue-700 text-sm font-medium">
                      {uploadState.progress}%
                    </span>
                  </div>
                  <Progress className="h-2" value={uploadState.progress} />
                </div>
              )}

              {/* 标签 */}
              <form.Field name="tags">
                {(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name} className="flex items-center gap-1.5">
                        <Hash size={14} />
                        标签
                      </FieldLabel>
                      <TagsInput
                        value={field.state.value}
                        onChange={field.handleChange}
                        onBlur={field.handleBlur}
                        disabled={uploadState.isUploading}
                      />
                      {isInvalid && (
                        <FieldError
                          errors={field.state.meta.errors.map((err) => ({ message: err }))}
                        />
                      )}
                    </Field>
                  );
                }}
              </form.Field>

              {/* 位置 - 已隐藏 */}
              {/* <form.Field name="location">
                {(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name} className="flex items-center gap-1.5">
                        <MapPin size={14} />
                        位置
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="添加位置信息（可选）"
                        disabled={uploadState.isUploading}
                        aria-invalid={isInvalid}
                      />
                      {isInvalid && (
                        <FieldError
                          errors={field.state.meta.errors.map((err) => ({ message: err }))}
                        />
                      )}
                    </Field>
                  );
                }}
              </form.Field> */}
            </FieldGroup>
          </div>

          {/* 固定底部提交按钮 */}
          <div className="flex-shrink-0 border-t border-gray-100 p-6">
            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <Button
                  className="w-full"
                  disabled={!canSubmit || uploadState.isUploading}
                  size="lg"
                  type="submit"
                >
                  {uploadState.isUploading
                    ? "上传中..."
                    : isSubmitting
                      ? "提交中..."
                      : editMode
                        ? "保存修改"
                        : "发布动态"}
                </Button>
              )}
            </form.Subscribe>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
