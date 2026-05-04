import { useNavigate } from "@tanstack/react-router";
import { Eye, Hash, PenLine } from "lucide-react";
import type { Value } from "platejs";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import MarkdownRenderer from "@/components/editor/MarkdownRenderer";
import { PlateEditor } from "@/components/editor/PlateEditor";
import RichTextContent from "@/components/editor/RichTextContent";
import PageLayout from "@/components/layout/PageLayout";
import { MediaUploader, type UnifiedMediaItem } from "@/components/media/MediaUploader";
import { UploadOverlay } from "@/components/common/UploadOverlay";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TagsInput } from "@/components/ui/tags-input";
import { useIsAuthenticated } from "@/hooks/useAuth";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useCreateTopic } from "@/hooks/useTopics";
import { sanitizeHtml } from "@/lib/sanitize";
import { serializeToHtml } from "@/lib/serializeHtml";
import type { OSSFile } from "@/services/upload/ossService";

type ContentMode = "richtext" | "markdown";

const initialValue: Value = [{ type: "p", children: [{ text: "" }] }];
const titleSchema = z.string().min(1, "标题不能为空").max(100, "标题不能超过100个字符");

export default function PublishPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useIsAuthenticated();
  const createTopicMutation = useCreateTopic();
  const { uploadState, uploadMultipleFiles } = useFileUpload();

  const [title, setTitle] = useState("");
  const [titleError, setTitleError] = useState<string | null>(null);
  const [contentMode, setContentMode] = useState<ContentMode>("richtext");
  const [richContent, setRichContent] = useState<Value>(initialValue);
  const [markdownContent, setMarkdownContent] = useState("");
  const [tags, setTags] = useState("");
  const [mediaItems, setMediaItems] = useState<UnifiedMediaItem[]>([]);
  const [isCompressMode, setIsCompressMode] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showUploadComplete, setShowUploadComplete] = useState(false);

  // 上传完成后短暂显示完成状态，再自动消失
  useEffect(() => {
    if (!uploadState.isUploading && uploadState.stage === "complete" && uploadState.progress === 100) {
      setShowUploadComplete(true);
      const timer = setTimeout(() => setShowUploadComplete(false), 1200);
      return () => clearTimeout(timer);
    }
  }, [uploadState.isUploading, uploadState.stage, uploadState.progress]);

  if (!isAuthenticated) {
    navigate({ to: "/" });
    return null;
  }

  const isContentEmpty = useCallback(() => {
    if (contentMode === "markdown") return !markdownContent.trim();
    return richContent.every((node) => {
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
  }, [contentMode, markdownContent, richContent]);

  const handleSubmit = async () => {
    const titleResult = titleSchema.safeParse(title);
    if (!titleResult.success) {
      setTitleError(titleResult.error.issues[0].message);
      return;
    }
    setTitleError(null);

    if (isContentEmpty()) {
      toast.error("请输入内容");
      return;
    }

    setIsSubmitting(true);
    try {
      const newItems = mediaItems.filter((item) => item.type === "new");
      let uploadedFiles: OSSFile[] = [];

      if (newItems.length > 0) {
        const filesToUpload: File[] = [];
        const locationMap = new Map<File, { lat: number; lng: number }>();
        newItems.forEach((item) => {
          filesToUpload.push(item.data.file);
          if (!item.data.hasGPS && item.data.lat != null && item.data.lng != null) {
            locationMap.set(item.data.file, { lat: item.data.lat, lng: item.data.lng });
          }
          if (item.data.videoFile) filesToUpload.push(item.data.videoFile);
        });
        uploadedFiles = await uploadMultipleFiles(
          filesToUpload,
          { compress: isCompressMode, maxSizeMB: isCompressMode ? 20 : undefined },
          locationMap.size > 0 ? locationMap : undefined,
        );
      }

      let finalContent: string;
      let contentType: string;
      if (contentMode === "markdown") {
        finalContent = markdownContent;
        contentType = "markdown";
      } else {
        finalContent = sanitizeHtml(serializeToHtml(richContent));
        contentType = "html";
      }

      const fileSecUids: string[] = [];
      let offset = 0;
      for (const item of mediaItems) {
        if (item.type === "existing") {
          if (item.data.sec_uid) fileSecUids.push(item.data.sec_uid);
        } else {
          if (uploadedFiles[offset]) fileSecUids.push(uploadedFiles[offset].sec_uid);
          offset++;
          if (item.data.videoFile) offset++;
        }
      }

      const postData: any = { title, content: finalContent, content_type: contentType };
      if (tags.trim()) {
        postData.tags = tags.split(",").map((t) => t.trim()).filter(Boolean);
      }
      if (fileSecUids.length > 0) postData.file_sec_uids = fileSecUids;

      createTopicMutation.mutate(postData, {
        onSuccess: () => navigate({ to: "/" }),
        onError: () => setIsSubmitting(false),
      });
    } catch (error) {
      console.error("提交失败:", error);
      toast.error("提交失败，请重试");
      setIsSubmitting(false);
    }
  };

  const getPreviewHtml = () => serializeToHtml(richContent);

  return (
    <PageLayout activeTab="publish">
      {/* 全屏上传进度遮罩 */}
      <UploadOverlay
        isComplete={showUploadComplete}
        isUploading={uploadState.isUploading}
        progress={uploadState.progress}
        stageText={uploadState.stageText}
      />
      <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className={`grid gap-6 ${showPreview ? "grid-cols-1 lg:grid-cols-2" : "mx-auto max-w-2xl grid-cols-1"}`}>
          {/* 编辑区 */}
          <div className="rounded-xl border bg-card shadow-sm">
            {/* 卡片内顶部工具栏 */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3">
              <Tabs onValueChange={(v) => setContentMode(v as ContentMode)} value={contentMode}>
                <TabsList className="h-8">
                  <TabsTrigger className="gap-1.5 text-xs" value="richtext">
                    <PenLine size={13} />
                    富文本
                  </TabsTrigger>
                  <TabsTrigger className="gap-1.5 text-xs" value="markdown">
                    <span className="font-mono font-bold text-xs">M↓</span>
                    Markdown
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex items-center gap-2">
                <Button
                  className="gap-1.5"
                  onClick={() => setShowPreview(!showPreview)}
                  size="sm"
                  variant={showPreview ? "default" : "outline"}
                >
                  <Eye size={14} />
                  预览
                </Button>

                <Button
                  className="rounded-full px-5"
                  disabled={isSubmitting || uploadState.isUploading}
                  onClick={handleSubmit}
                  size="sm"
                >
                  {uploadState.isUploading ? "上传中..." : isSubmitting ? "发布中..." : "发布"}
                </Button>
              </div>
            </div>

            {/* 表单内容 */}
            <div className="space-y-5 p-5">
            {/* 标题 */}
            <div className="space-y-1.5">
              <Label htmlFor="publish-title">
                标题 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="publish-title"
                onChange={(e) => { setTitle(e.target.value); if (titleError) setTitleError(null); }}
                placeholder="给你的动态起个吸引人的标题..."
                value={title}
              />
              {titleError && <p className="text-destructive text-sm">{titleError}</p>}
            </div>

            {/* 内容编辑器 */}
            <div className="space-y-1.5">
              <Label>内容 <span className="text-destructive">*</span></Label>
              {contentMode === "richtext" ? (
                <PlateEditor
                  onChange={setRichContent}
                  placeholder="分享你的想法、感受或故事..."
                  value={richContent}
                />
              ) : (
                <textarea
                  className="min-h-[300px] w-full resize-y rounded-xl border-0 bg-secondary/30 px-4 py-3 font-mono text-sm transition-all placeholder:text-muted-foreground focus:bg-background focus:outline-none focus:ring-2 focus:ring-ring/20"
                  onChange={(e) => setMarkdownContent(e.target.value)}
                  placeholder="使用 Markdown 语法编写内容..."
                  value={markdownContent}
                />
              )}
            </div>

            {/* 图片压缩 */}
            <div className="flex items-center justify-between">
              <Label className="font-medium text-sm">图片压缩</Label>
              <div className="flex items-center gap-2">
                <Switch checked={isCompressMode} id="publish-compress" onCheckedChange={setIsCompressMode} />
                <Label className="cursor-pointer font-normal text-muted-foreground text-sm" htmlFor="publish-compress">
                  启用图片压缩（压缩至 20MB 以下）
                </Label>
              </div>
            </div>

            {/* 媒体上传 */}
            <MediaUploader compressLargeFiles={isCompressMode} disabled={uploadState.isUploading} onChange={setMediaItems} />

            {/* 标签 */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5"><Hash size={14} />标签</Label>
              <TagsInput disabled={uploadState.isUploading} onChange={setTags} value={tags} />
            </div>
            </div>
          </div>

          {/* 预览区 */}
          {showPreview && (
            <div className="rounded-xl border bg-card shadow-sm">
              <div className="flex items-center gap-2 border-b px-5 py-3">
                <Eye className="text-muted-foreground" size={16} />
                <span className="font-medium text-muted-foreground text-sm">实时预览</span>
              </div>
              <div className="max-h-[calc(100vh-220px)] overflow-y-auto p-5">
                {title && <h2 className="mb-4 font-bold text-xl">{title}</h2>}

                <div className="min-h-[200px]">
                  {contentMode === "markdown" ? (
                    markdownContent ? (
                      <MarkdownRenderer content={markdownContent} />
                    ) : (
                      <p className="text-muted-foreground italic">Markdown 内容预览将在这里显示...</p>
                    )
                  ) : (() => {
                    const html = getPreviewHtml();
                    return html && html !== "<p></p>" ? (
                      <RichTextContent content={html} />
                    ) : (
                      <p className="text-muted-foreground italic">富文本内容预览将在这里显示...</p>
                    );
                  })()}
                </div>

                {tags.trim() && (
                  <div className="mt-4 flex flex-wrap gap-2 border-t pt-4">
                    {tags.split(",").map((t) => t.trim()).filter(Boolean).map((tag) => (
                      <span className="rounded-full bg-secondary px-3 py-1 text-secondary-foreground text-xs" key={tag}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
