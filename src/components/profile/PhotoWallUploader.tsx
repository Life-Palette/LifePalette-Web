import { EyeOff, Globe, Image, Upload, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { useFileUpload } from "@/hooks/useFileUpload";
import { extractGPSFromImage } from "@/utils/upload/gpsExtractor";

interface PhotoWallUploaderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadSuccess?: () => void;
}

interface PreviewFile {
  file: File;
  preview: string;
  hasGPS: boolean;
}

export default function PhotoWallUploader({
  open,
  onOpenChange,
  onUploadSuccess,
}: PhotoWallUploaderProps) {
  const [selectedFiles, setSelectedFiles] = useState<PreviewFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isPrivate, setIsPrivate] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadState, uploadMultipleFiles, resetState } = useFileUpload();

  // 文件大小限制：20MB
  const MAX_FILE_SIZE = 20 * 1024 * 1024;

  // 添加文件
  const addFiles = useCallback(async (files: File[]) => {
    // 只接受图片
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length === 0) {
      toast.error("请选择图片文件");
      return;
    }

    // 检查文件大小
    const validFiles: File[] = [];
    const oversizedFiles: string[] = [];

    imageFiles.forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        oversizedFiles.push(file.name);
      } else {
        validFiles.push(file);
      }
    });

    if (oversizedFiles.length > 0) {
      toast.error("文件大小超出限制", {
        description: `以下文件超过 20MB 已被忽略：${oversizedFiles.join(", ")}`,
      });
    }

    if (validFiles.length === 0) return;

    // 检测 GPS 信息并创建预览
    const previewFiles: PreviewFile[] = await Promise.all(
      validFiles.map(async (file) => {
        const preview = URL.createObjectURL(file);
        const gps = await extractGPSFromImage(file);
        return {
          file,
          preview,
          hasGPS: gps !== null,
        };
      }),
    );

    setSelectedFiles((prev) => [...prev, ...previewFiles]);
  }, []);

  // 处理文件选择
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    addFiles(files);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // 处理拖拽
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/"),
    );
    addFiles(files);
  };

  // 移除文件
  const handleRemoveFile = useCallback((index: number) => {
    setSelectedFiles((prev) => {
      const file = prev[index];
      URL.revokeObjectURL(file.preview);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  // 重置状态
  const handleReset = useCallback(() => {
    selectedFiles.forEach((file) => URL.revokeObjectURL(file.preview));
    setSelectedFiles([]);
    setIsPrivate(true);
    resetState();
  }, [selectedFiles, resetState]);

  // 关闭对话框
  const handleClose = useCallback(() => {
    if (!uploadState.isUploading) {
      handleReset();
      onOpenChange(false);
    }
  }, [uploadState.isUploading, handleReset, onOpenChange]);

  // 上传文件
  const handleUpload = useCallback(async () => {
    if (selectedFiles.length === 0) {
      toast.error("请先选择图片");
      return;
    }

    try {
      const files = selectedFiles.map((f) => f.file);
      await uploadMultipleFiles(files, { isPrivate });

      toast.success("上传成功", {
        description: `已成功上传 ${files.length} 张图片`,
      });

      handleReset();
      onOpenChange(false);
      onUploadSuccess?.();
    } catch (error) {
      toast.error("上传失败", {
        description: error instanceof Error ? error.message : "请稍后重试",
      });
    }
  }, [selectedFiles, uploadMultipleFiles, handleReset, onOpenChange, onUploadSuccess, isPrivate]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>上传图片到照片墙</DialogTitle>
          <DialogDescription>
            上传的图片默认为「仅自己可见」状态，可在照片墙中调整可见性
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 上传区域 */}
          <div
            className={`rounded-xl border-2 border-dashed p-6 text-center transition-all ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/50"
            } ${uploadState.isUploading ? "pointer-events-none opacity-50" : ""}`}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <label className="group block cursor-pointer" htmlFor="photo-wall-upload">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-muted transition-colors group-hover:bg-muted/80">
                <Image className="text-muted-foreground" size={20} />
              </div>
              <p className="text-foreground text-sm">点击或拖拽上传图片</p>
              <p className="text-muted-foreground text-xs mt-1">
                支持 JPG、PNG、WEBP 等格式，单文件需要小于 20MB
              </p>
            </label>
            <input
              accept="image/*"
              className="hidden"
              disabled={uploadState.isUploading}
              id="photo-wall-upload"
              multiple
              onChange={handleFileChange}
              ref={fileInputRef}
              type="file"
            />
          </div>

          {/* 预览网格 */}
          {selectedFiles.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  已选择 <span className="text-foreground font-medium">{selectedFiles.length}</span> 张图片
                </p>
                {!uploadState.isUploading && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    className="text-muted-foreground"
                  >
                    清空
                  </Button>
                )}
              </div>

              <div className="max-h-[280px] overflow-y-auto rounded-lg border p-2">
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-6">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={`${file.file.name}-${index}`}
                      className="group relative aspect-square overflow-hidden rounded-md bg-muted"
                    >
                      <img
                        src={file.preview}
                        alt={file.file.name}
                        className="h-full w-full object-cover"
                      />
                      {/* GPS 标识 */}
                      {file.hasGPS && (
                        <div className="absolute bottom-1 left-1 rounded bg-black/50 px-1.5 py-0.5 text-[10px] text-white">
                          GPS
                        </div>
                      )}
                      {/* 删除按钮 */}
                      {!uploadState.isUploading && (
                        <button
                          className="absolute top-1 right-1 rounded-full bg-black/50 p-1 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/70"
                          onClick={() => handleRemoveFile(index)}
                          type="button"
                        >
                          <X className="text-white" size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 可见性设置 */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-3">
              {isPrivate ? (
                <EyeOff size={18} className="text-muted-foreground" />
              ) : (
                <Globe size={18} className="text-muted-foreground" />
              )}
              <div>
                <Label htmlFor="private-switch" className="text-sm font-medium cursor-pointer">
                  {isPrivate ? "仅自己可见" : "公开"}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {isPrivate
                    ? "上传的图片仅自己可见，不会纳入「色集」与「轨迹」的数据统计"
                    : "上传的图片将公开展示，并纳入「色集」与「轨迹」的数据统计"}
                </p>
              </div>
            </div>
            <Switch
              id="private-switch"
              checked={isPrivate}
              onCheckedChange={setIsPrivate}
              disabled={uploadState.isUploading}
            />
          </div>

          {/* 上传进度 */}
          {uploadState.isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{uploadState.stageText}</span>
                <span className="text-foreground font-medium">{uploadState.progress}%</span>
              </div>
              <Progress value={uploadState.progress} className="h-2" />
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={uploadState.isUploading}
            >
              取消
            </Button>
            <Button
              onClick={handleUpload}
              disabled={selectedFiles.length === 0 || uploadState.isUploading}
            >
              <Upload size={16} className="mr-2" />
              {uploadState.isUploading ? "上传中..." : `上传 ${selectedFiles.length} 张图片`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
