import { Camera, X } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { PROFILE_VALIDATION, VALIDATION_MESSAGES } from "@/constants/validation";

interface BackgroundUploadProps {
  currentBackground?: string;
  previewBackground?: string | null;
  onBackgroundChange: (file: File, preview: string) => void;
  onError: (error: string) => void;
  onRemove?: () => void;
  error?: string;
}

export default function BackgroundUpload({
  currentBackground,
  previewBackground,
  onBackgroundChange,
  onError,
  onRemove,
  error,
}: BackgroundUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [selectedImageSrc, setSelectedImageSrc] = useState<string>("");
  const [originalFileName, setOriginalFileName] = useState<string>("");

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!(PROFILE_VALIDATION.AVATAR.ALLOWED_TYPES as readonly string[]).includes(file.type)) {
      onError(VALIDATION_MESSAGES.AVATAR_INVALID_TYPE);
      return;
    }

    // 验证文件大小（背景图片允许更大）
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      onError("背景图片大小不能超过 10MB");
      return;
    }

    // 清除之前的错误
    onError("");

    // 保存原始文件名
    setOriginalFileName(file.name);

    // 创建预览URL并打开裁剪对话框
    const previewUrl = URL.createObjectURL(file);
    setSelectedImageSrc(previewUrl);
    setCropDialogOpen(true);
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    // 将 Blob 转换为 File
    const croppedFile = new File([croppedBlob], originalFileName, {
      type: "image/jpeg",
    });

    // 创建预览URL
    const previewUrl = URL.createObjectURL(croppedBlob);
    onBackgroundChange(croppedFile, previewUrl);

    // 清理旧的 URL
    if (selectedImageSrc) {
      URL.revokeObjectURL(selectedImageSrc);
    }
  };

  const handleCropClose = () => {
    setCropDialogOpen(false);
    // 清理 URL
    if (selectedImageSrc) {
      URL.revokeObjectURL(selectedImageSrc);
    }
    // 重置文件输入
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const displayBackground = previewBackground || currentBackground;

  return (
    <>
      <div className="space-y-3">
        <div className="relative h-48 w-full overflow-hidden rounded-lg border-2 border-dashed border-border bg-muted transition-colors hover:border-primary">
          {displayBackground ? (
            <>
              <img
                alt="Background"
                className="h-full w-full object-cover"
                src={displayBackground}
              />
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity hover:opacity-100">
                <Button
                  className="h-10 w-10 rounded-full"
                  onClick={handleClick}
                  size="icon"
                  type="button"
                  variant="secondary"
                >
                  <Camera size={18} />
                </Button>
                {onRemove && (
                  <Button
                    className="h-10 w-10 rounded-full"
                    onClick={onRemove}
                    size="icon"
                    type="button"
                    variant="destructive"
                  >
                    <X size={18} />
                  </Button>
                )}
              </div>
            </>
          ) : (
            <button
              className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
              onClick={handleClick}
              type="button"
            >
              <Camera size={32} />
              <p className="text-sm">点击上传背景图片</p>
              <p className="text-xs">建议尺寸 1920x1080，支持 JPG、PNG、WebP</p>
            </button>
          )}
          <input
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
            ref={fileInputRef}
            type="file"
          />
        </div>
        {error && (
          <p className="text-center text-sm text-red-500" role="alert">
            {error}
          </p>
        )}
      </div>

      {/* 裁剪对话框 - 使用 16:9 比例 */}
      <BackgroundCropDialog
        imageSrc={selectedImageSrc}
        onClose={handleCropClose}
        onCropComplete={handleCropComplete}
        open={cropDialogOpen}
      />
    </>
  );
}

// 背景图片裁剪对话框（16:9 比例）
import { useCallback } from "react";
import Cropper, { type Area } from "react-easy-crop";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BackgroundCropDialogProps {
  open: boolean;
  imageSrc: string;
  onClose: () => void;
  onCropComplete: (croppedImage: Blob) => void;
}

// 创建裁剪后的图片
const createCroppedImage = async (imageSrc: string, pixelCrop: Area): Promise<Blob> => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("无法获取 canvas context");
  }

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Canvas 转换失败"));
        }
      },
      "image/jpeg",
      0.95,
    );
  });
};

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.src = url;
  });

function BackgroundCropDialog({
  open,
  imageSrc,
  onClose,
  onCropComplete,
}: BackgroundCropDialogProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropChange = useCallback((crop: { x: number; y: number }) => {
    setCrop(crop);
  }, []);

  const onZoomChange = useCallback((zoom: number) => {
    setZoom(zoom);
  }, []);

  const onCropAreaChange = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;

    try {
      setIsProcessing(true);
      const croppedImage = await createCroppedImage(imageSrc, croppedAreaPixels);
      onCropComplete(croppedImage);
      onClose();
    } catch (error) {
      console.error("裁剪失败:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog onOpenChange={onClose} open={open}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>裁剪背景图片</DialogTitle>
        </DialogHeader>

        <div className="relative h-[400px] w-full bg-black">
          <Cropper
            aspect={16 / 9}
            crop={crop}
            cropShape="rect"
            image={imageSrc}
            onCropChange={onCropChange}
            onCropComplete={onCropAreaChange}
            onZoomChange={onZoomChange}
            showGrid={true}
            zoom={zoom}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">缩放</label>
          <input
            className="w-full"
            max={3}
            min={1}
            onChange={(e) => setZoom(Number(e.target.value))}
            step={0.1}
            type="range"
            value={zoom}
          />
        </div>

        <DialogFooter>
          <Button disabled={isProcessing} onClick={onClose} variant="outline">
            取消
          </Button>
          <Button disabled={isProcessing} onClick={handleConfirm}>
            {isProcessing ? "处理中..." : "确认"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
