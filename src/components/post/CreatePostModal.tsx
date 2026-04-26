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
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { TagsInput } from "@/components/ui/tags-input";
import { useFileUpload } from "@/hooks/useFileUpload";
import { sanitizeHtml } from "@/lib/sanitize";
import { deserializeHtml, serializeToHtml } from "@/lib/serializeHtml";
import type { OSSFile } from "@/services/upload/ossService";
import type { Post, PostImage } from "@/types";

interface CreatePostModalProps {
  editMode?: boolean;
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
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    postData: Omit<
      Post,
      "id" | "author" | "likes" | "comments" | "saves" | "isLiked" | "isSaved" | "createdAt"
    >
  ) => void;
  topicId?: number;
}

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
  const [isCompressMode, setIsCompressMode] = useState(true);

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
        let uploadedFiles: OSSFile[] = [];

        if (newItems.length > 0) {
          const filesToUpload: File[] = [];
          const locationMap = new Map<File, { lat: number; lng: number }>();

          newItems.forEach((item) => {
            filesToUpload.push(item.data.file);
            // 仅当 EXIF 中没有 GPS 且用户手动设置了位置时，才传给后端
            if (!item.data.hasGPS && item.data.lat != null && item.data.lng != null) {
              locationMap.set(item.data.file, { lat: item.data.lat, lng: item.data.lng });
            }
            if (item.data.videoFile) {
              filesToUpload.push(item.data.videoFile);
            }
          });

          uploadedFiles = await uploadMultipleFiles(
            filesToUpload,
            {
              compress: isCompressMode,
              maxSizeMB: isCompressMode ? 20 : undefined,
            },
            locationMap.size > 0 ? locationMap : undefined
          );
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
        if (value.tags?.trim()) {
          postData.tags = value.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag.length > 0);
        }

        // 5. 按照 mediaItems 的顺序构建 file_sec_uids
        const fileSecUids: string[] = [];
        let uploadedFileOffset = 0;

        for (const item of mediaItems) {
          if (item.type === "existing") {
            // 已有文件的 sec_uid
            if (item.data.sec_uid) {
              fileSecUids.push(item.data.sec_uid);
            }
          } else {
            if (uploadedFiles[uploadedFileOffset]) {
              fileSecUids.push(uploadedFiles[uploadedFileOffset].sec_uid);
            }
            // 跳过图片，如果有配对的视频文件也跳过
            uploadedFileOffset++;
            if (item.data.videoFile) {
              uploadedFileOffset++;
            }
          }
        }

        if (fileSecUids.length > 0) {
          postData.file_sec_uids = fileSecUids;
        }

        // 6. 实际提交
        console.log(editMode ? "🔄-----更新数据-----" : "🍪-----创建数据-----", postData);
        onSubmit(postData);

        // 7. 重置表单（仅在创建模式）
        if (!editMode) {
          form.reset();
          setContent(initialValue);
          setMediaItems([]);
          setIsCompressMode(true);
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
        setContent(deserializeHtml(initialData.content));
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
      setIsCompressMode(true);
    }
  }, [
    isOpen,
    editMode,
    initialData,
    form.setFieldValue, // 创建模式：重置表单
    form.reset,
  ]);

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
      <DialogContent className="flex max-h-[85vh] max-w-2xl sm:max-w-2xl flex-col p-0">
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
                        aria-invalid={isInvalid}
                        disabled={uploadState.isUploading}
                        id={field.name}
                        name={field.name}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="给你的动态起个吸引人的标题..."
                        value={field.state.value}
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
                  key={
                    editMode
                      ? `${initialData?.title ?? ""}-${(initialData?.content ?? "").slice(0, 40)}`
                      : "create"
                  }
                  onChange={setContent}
                  placeholder="分享你的想法、感受或故事..."
                  value={content}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="font-medium text-sm">图片压缩</Label>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={isCompressMode}
                    id="compress-mode"
                    onCheckedChange={setIsCompressMode}
                  />
                  <Label
                    className="cursor-pointer font-normal text-gray-500 text-sm"
                    htmlFor="compress-mode"
                  >
                    启用图片压缩（压缩至 20MB 以下）
                  </Label>
                </div>
              </div>

              {/* 媒体上传区域 */}
              <MediaUploader
                compressLargeFiles={isCompressMode}
                disabled={uploadState.isUploading}
                initialImages={initialData?.images}
                onChange={setMediaItems}
              />

              {/* 上传进度 */}
              {uploadState.isUploading && (
                <div className="space-y-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Loader2 className="animate-spin text-blue-600" size={16} />
                      <span className="font-medium text-blue-900 text-sm">
                        {uploadState.stageText}
                      </span>
                    </div>
                    <span className="font-medium text-blue-700 text-sm">
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
                      <FieldLabel className="flex items-center gap-1.5" htmlFor={field.name}>
                        <Hash size={14} />
                        标签
                      </FieldLabel>
                      <TagsInput
                        disabled={uploadState.isUploading}
                        onBlur={field.handleBlur}
                        onChange={field.handleChange}
                        value={field.state.value}
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
          <div className="flex-shrink-0 border-gray-100 border-t p-6">
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
