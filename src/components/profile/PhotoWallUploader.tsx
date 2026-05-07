import { EyeOff, Globe, Upload } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { MediaUploader, type UnifiedMediaItem } from "@/components/media/MediaUploader";
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

interface PhotoWallUploaderProps {
  onOpenChange: (open: boolean) => void;
  onUploadSuccess?: () => void;
  open: boolean;
}

export default function PhotoWallUploader({
  open,
  onOpenChange,
  onUploadSuccess,
}: PhotoWallUploaderProps) {
  const [mediaItems, setMediaItems] = useState<UnifiedMediaItem[]>([]);
  const [isPrivate, setIsPrivate] = useState(true);

  const { uploadState, uploadMultipleFiles, resetState } = useFileUpload();

  // 重置状态
  const handleReset = useCallback(() => {
    setMediaItems([]);
    setIsPrivate(true);
    resetState();
  }, [resetState]);

  // 关闭对话框
  const handleClose = useCallback(() => {
    if (!uploadState.isUploading) {
      handleReset();
      onOpenChange(false);
    }
  }, [uploadState.isUploading, handleReset, onOpenChange]);

  // 上传文件
  const handleUpload = useCallback(async () => {
    const newItems = mediaItems.filter((item) => item.type === "new");
    if (newItems.length === 0) {
      toast.error("请先选择图片或视频");
      return;
    }

    try {
      const filesToUpload: File[] = [];
      const locationMap = new Map<File, { lat: number; lng: number }>();

      newItems.forEach((item) => {
        filesToUpload.push(item.data.file);
        if (!item.data.hasGPS && item.data.lat != null && item.data.lng != null) {
          locationMap.set(item.data.file, { lat: item.data.lat, lng: item.data.lng });
        }
        if (item.data.videoFile) {
          filesToUpload.push(item.data.videoFile);
        }
      });

      await uploadMultipleFiles(
        filesToUpload,
        { compress: true, isPrivate, maxSizeMB: 20 },
        locationMap.size > 0 ? locationMap : undefined
      );

      toast.success("上传成功", {
        description: `已成功上传 ${newItems.length} 个媒体文件`,
      });

      handleReset();
      onOpenChange(false);
      onUploadSuccess?.();
    } catch (error) {
      toast.error("上传失败", {
        description: error instanceof Error ? error.message : "请稍后重试",
      });
    }
  }, [mediaItems, uploadMultipleFiles, handleReset, onOpenChange, onUploadSuccess, isPrivate]);

  return (
    <Dialog onOpenChange={handleClose} open={open}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>上传图片到照片墙</DialogTitle>
          <DialogDescription>
            上传的图片默认为「仅自己可见」状态，可在照片墙中调整可见性
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <MediaUploader
            compressLargeFiles={true}
            disabled={uploadState.isUploading}
            onChange={setMediaItems}
          />

          {/* 可见性设置 */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-3">
              {isPrivate ? (
                <EyeOff className="text-muted-foreground" size={18} />
              ) : (
                <Globe className="text-muted-foreground" size={18} />
              )}
              <div>
                <Label className="cursor-pointer font-medium text-sm" htmlFor="private-switch">
                  {isPrivate ? "仅自己可见" : "公开"}
                </Label>
                <p className="text-muted-foreground text-xs">
                  {isPrivate
                    ? "上传的图片仅自己可见，不会纳入「色集」与「轨迹」的数据统计"
                    : "上传的图片将公开展示，并纳入「色集」与「轨迹」的数据统计"}
                </p>
              </div>
            </div>
            <Switch
              checked={isPrivate}
              disabled={uploadState.isUploading}
              id="private-switch"
              onCheckedChange={setIsPrivate}
            />
          </div>

          {/* 上传进度 */}
          {uploadState.isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{uploadState.stageText}</span>
                <span className="font-medium text-foreground">{uploadState.progress}%</span>
              </div>
              <Progress className="h-2" value={uploadState.progress} />
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex justify-end gap-2 pt-2">
            <Button disabled={uploadState.isUploading} onClick={handleClose} variant="outline">
              取消
            </Button>
            <Button
              disabled={mediaItems.length === 0 || uploadState.isUploading}
              onClick={handleUpload}
            >
              <Upload className="mr-2" size={16} />
              {uploadState.isUploading ? "上传中..." : `上传 ${mediaItems.length} 个媒体`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
