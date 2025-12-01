import { Camera } from "lucide-react";
import { useRef, useState } from "react";
import AvatarCropDialog from "@/components/media/AvatarCropDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PROFILE_VALIDATION, VALIDATION_MESSAGES } from "@/constants/validation";

interface AvatarUploadProps {
  currentAvatar?: string;
  previewAvatar?: string | null;
  onAvatarChange: (file: File, preview: string) => void;
  onError: (error: string) => void;
  error?: string;
}

export default function AvatarUpload({
  currentAvatar,
  previewAvatar,
  onAvatarChange,
  onError,
  error,
}: AvatarUploadProps) {
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

    // 验证文件大小
    if (file.size > PROFILE_VALIDATION.AVATAR.MAX_SIZE) {
      onError(VALIDATION_MESSAGES.AVATAR_TOO_LARGE);
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
    onAvatarChange(croppedFile, previewUrl);

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

  const displayAvatar = previewAvatar || currentAvatar;

  return (
    <>
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <Avatar className="h-28 w-28 ring-2 ring-border ring-offset-2">
            <AvatarImage alt="Avatar" className="object-cover" src={displayAvatar} />
            <AvatarFallback className="bg-muted text-2xl">头像</AvatarFallback>
          </Avatar>
          <button
            className="absolute -bottom-1 -right-1 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all hover:scale-110 hover:bg-primary/90"
            onClick={handleClick}
            type="button"
          >
            <Camera size={18} />
          </button>
          <input
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
            ref={fileInputRef}
            type="file"
          />
        </div>
        <p className="text-center text-muted-foreground text-xs">点击相机图标更换头像</p>
        {error && (
          <p className="text-center text-sm text-red-500" role="alert">
            {error}
          </p>
        )}
      </div>

      {/* 裁剪对话框 */}
      <AvatarCropDialog
        imageSrc={selectedImageSrc}
        onClose={handleCropClose}
        onCropComplete={handleCropComplete}
        open={cropDialogOpen}
      />
    </>
  );
}
