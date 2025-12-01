import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { LivePhotoViewer } from "live-photo";
import { GripVertical, Image, MapPin, Video, X } from "lucide-react";
import React, { useRef, useState } from "react";
import { toast } from "sonner";
import { LocationPicker } from "@/components/map/LocationPicker";
import { apiService } from "@/services/api";
import type { PostImage } from "@/types";
import { detectLocalLivePhotos } from "@/utils/upload/fileProcessor";
import { extractGPSFromImage } from "@/utils/upload/gpsExtractor";

// 统一的 MediaItem 类型定义
type MediaItemType = "existing" | "new";

interface BaseMediaItem {
  id: string;
  type: MediaItemType;
}

interface ExistingMediaItem extends BaseMediaItem {
  type: "existing";
  data: PostImage;
}

interface NewMediaItem extends BaseMediaItem {
  type: "new";
  data: {
    file: File;
    videoFile?: File;
    originalIndex: number;
    hasGPS?: boolean;
    lat?: number;
    lng?: number;
  };
}

export type UnifiedMediaItem = ExistingMediaItem | NewMediaItem;

// 统一的媒体项组件
interface UnifiedSortableMediaItemProps {
  item: UnifiedMediaItem;
  onRemove: () => void;
  onLocationAdd?: (itemId: string, location: { lat: number; lng: number }) => void;
}

function UnifiedSortableMediaItem({
  item,
  onRemove,
  onLocationAdd,
}: UnifiedSortableMediaItemProps) {
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const [preview, setPreview] = useState<string>("");
  const [videoPreview, setVideoPreview] = useState<string>("");
  const livePhotoRef = useRef<HTMLDivElement>(null);

  // 判断是否有地理位置信息
  const hasLocation =
    item.type === "existing"
      ? !!(item.data.lat && item.data.lng)
      : !!(item.data.lat && item.data.lng);

  // 获取初始位置（如果有）
  const initialLocation = hasLocation ? { lat: item.data.lat!, lng: item.data.lng! } : undefined;

  // 为新文件创建预览 URL
  React.useEffect(() => {
    if (item.type === "new") {
      const url = URL.createObjectURL(item.data.file);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [item]);

  React.useEffect(() => {
    if (item.type === "new" && item.data.videoFile) {
      const url = URL.createObjectURL(item.data.videoFile);
      setVideoPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [item]);

  // 判断媒体类型
  const isLivePhoto =
    item.type === "existing" ? !!(item.data as any).videoSrc : !!item.data.videoFile;
  const isVideo =
    item.type === "existing"
      ? item.data.type?.startsWith("video/")
      : item.data.file.type.startsWith("video/");

  // 获取显示 URL
  const imageUrl =
    item.type === "existing"
      ? isVideo
        ? `${item.data.url}?x-oss-process=video/snapshot,t_1000,f_jpg,w_0,h_0,m_fast`
        : `${item.data.url}?x-oss-process=image/resize,w_300,h_200,m_lfit/quality,q_10/format,webp`
      : preview;
  const videoUrl = item.type === "existing" ? (item.data as any).videoSrc : videoPreview;

  // 初始化 Live Photo
  React.useEffect(() => {
    if (isLivePhoto && livePhotoRef.current && imageUrl && videoUrl) {
      try {
        new LivePhotoViewer({
          container: livePhotoRef.current,
          photoSrc: imageUrl,
          videoSrc: videoUrl,
          height: "100%",
          width: "100%",
          imageCustomization: {
            styles: {
              objectFit: "cover",
            },
          },
        });
      } catch (error) {
        console.error("Live Photo 初始化失败:", error);
      }
    }
  }, [isLivePhoto, imageUrl, videoUrl]);

  return (
    <div
      className="group relative aspect-square overflow-hidden rounded-lg bg-gray-100"
      ref={setNodeRef}
      style={style}
    >
      {/* 根据类型渲染内容 */}
      {isLivePhoto ? (
        <div className="h-full w-full" ref={livePhotoRef} />
      ) : isVideo ? (
        imageUrl && <video className="h-full w-full object-cover" src={imageUrl} />
      ) : (
        imageUrl && (
          <img
            alt={item.type === "existing" ? item.data.name : ""}
            className="h-full w-full object-cover"
            src={imageUrl}
          />
        )
      )}

      {/* 拖拽手柄 */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 cursor-grab rounded bg-black/50 p-1 opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
      >
        <GripVertical className="text-white" size={16} />
      </div>

      {/* 删除按钮 */}
      <button
        className="absolute top-2 right-2 rounded-full bg-black/50 p-1 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/70"
        onClick={onRemove}
        type="button"
      >
        <X className="text-white" size={16} />
      </button>

      {/* 视频标识 */}
      {isVideo && !isLivePhoto && (
        <div className="absolute bottom-2 right-2 rounded bg-black/50 px-2 py-1">
          <Video className="text-white" size={12} />
        </div>
      )}

      {/* 地理位置标识/添加按钮 */}
      <div className="absolute bottom-2 left-2">
        {hasLocation ? (
          <div
            className="rounded bg-black/50 px-2 py-1 flex items-center gap-1 cursor-pointer hover:bg-black/70 transition-colors backdrop-blur-sm"
            title="包含地理位置信息，点击修改"
            onClick={(e) => {
              e.stopPropagation();
              setShowLocationPicker(true);
            }}
          >
            <MapPin className="text-white" size={12} />
          </div>
        ) : (
          <button
            className="rounded bg-black/50 px-2 py-1 flex items-center gap-1 hover:bg-black/70 transition-colors backdrop-blur-sm opacity-0 group-hover:opacity-100"
            title="添加地理位置"
            onClick={(e) => {
              e.stopPropagation();
              setShowLocationPicker(true);
            }}
            type="button"
          >
            <MapPin className="text-white/70" size={12} />
            <span className="text-white/70 text-xs">添加位置</span>
          </button>
        )}
      </div>

      {/* 位置选择器 */}
      {showLocationPicker && (
        <LocationPicker
          isOpen={showLocationPicker}
          onClose={() => setShowLocationPicker(false)}
          initialLocation={initialLocation}
          onLocationSelect={(location) => {
            onLocationAdd?.(item.id, location);
            setShowLocationPicker(false);
          }}
        />
      )}
    </div>
  );
}

// MediaUploader 组件 Props
interface MediaUploaderProps {
  initialImages?: PostImage[];
  disabled?: boolean;
  onChange?: (items: UnifiedMediaItem[]) => void;
}

export function MediaUploader({
  initialImages = [],
  disabled = false,
  onChange,
}: MediaUploaderProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [unifiedMediaItems, setUnifiedMediaItems] = useState<UnifiedMediaItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 拖拽排序传感器
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // 初始化已有图片
  React.useEffect(() => {
    if (initialImages.length > 0) {
      const existingItems: ExistingMediaItem[] = initialImages.map((img) => ({
        id: `existing-${img.id}`,
        type: "existing",
        data: img,
      }));
      setUnifiedMediaItems(existingItems);
    }
  }, [initialImages]);

  // 通知父组件变化
  React.useEffect(() => {
    onChange?.(unifiedMediaItems);
  }, [unifiedMediaItems, onChange]);

  // 添加新文件到统一列表
  const addFiles = async (files: File[]) => {
    if (files.length === 0) return;

    // 文件大小限制：20MB
    const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB in bytes
    const validFiles: File[] = [];
    const oversizedFiles: string[] = [];

    files.forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        oversizedFiles.push(file.name);
      } else {
        validFiles.push(file);
      }
    });

    // 如果有超大文件，提示用户
    if (oversizedFiles.length > 0) {
      toast.error("文件大小超出限制", {
        description: `以下文件超过 20MB 已被忽略：\n${oversizedFiles.join(", ")}`,
      });
    }

    // 如果没有有效文件，直接返回
    if (validFiles.length === 0) return;

    // 更新原始文件列表
    const newSelectedFiles = [...selectedFiles, ...validFiles];
    setSelectedFiles(newSelectedFiles);

    // 检测 Live Photo 配对
    const livePhotoPairs = detectLocalLivePhotos(newSelectedFiles);
    const livePhotoMap = new Map<number, File>();
    livePhotoPairs.forEach((pair) => {
      livePhotoMap.set(pair.imageIndex, pair.videoFile);
    });

    // 过滤已配对的视频文件
    const pairedVideoIndices = new Set(livePhotoPairs.map((pair) => pair.videoIndex));
    const displayFiles = newSelectedFiles.filter((_, index) => !pairedVideoIndices.has(index));

    // 批量检测GPS信息
    const gpsCheckPromises = displayFiles.map(async (file) => {
      if (file.type.startsWith("image/")) {
        const gps = await extractGPSFromImage(file);
        return gps !== null;
      }
      return false;
    });
    const gpsResults = await Promise.all(gpsCheckPromises);

    // 创建新的媒体项
    const newItems: NewMediaItem[] = displayFiles.map((file, displayIndex) => {
      const originalIndex = newSelectedFiles.indexOf(file);
      const videoFile = livePhotoMap.get(originalIndex);

      return {
        id: `new-${Date.now()}-${displayIndex}`,
        type: "new",
        data: {
          file,
          videoFile,
          originalIndex,
          hasGPS: gpsResults[displayIndex],
        },
      };
    });

    // 添加到统一列表
    setUnifiedMediaItems((prev) => [...prev, ...newItems]);
  };

  // 处理文件选择
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    addFiles(files);

    // 清空文件输入
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

    const files = Array.from(e.dataTransfer.files).filter(
      (file) => file.type.startsWith("image/") || file.type.startsWith("video/"),
    );

    addFiles(files);
  };

  // 统一的拖拽排序处理
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setUnifiedMediaItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // 统一的删除媒体项逻辑
  const handleRemoveMediaItem = (itemId: string) => {
    setUnifiedMediaItems((prev) => {
      const item = prev.find((i) => i.id === itemId);
      if (!item) return prev;

      // 如果是新文件，从 selectedFiles 中移除
      if (item.type === "new") {
        const { videoFile, originalIndex } = item.data;
        setSelectedFiles((files) => {
          if (videoFile) {
            // Live Photo: 同时删除图片和视频
            const videoIndex = files.indexOf(videoFile);
            return files.filter((_, i) => i !== originalIndex && i !== videoIndex);
          }
          // 普通文件
          return files.filter((_, i) => i !== originalIndex);
        });
      }

      // 从统一列表中移除
      return prev.filter((i) => i.id !== itemId);
    });
  };

  // 处理添加位置
  const handleLocationAdd = async (itemId: string, location: { lat: number; lng: number }) => {
    // 先找到对应的 item
    const item = unifiedMediaItems.find((i) => i.id === itemId);
    if (!item) return;

    // 如果是已上传的图片，先调用API更新
    if (item.type === "existing") {
      try {
        await apiService.updateFileLocation(item.data.id, {
          lat: location.lat,
          lng: location.lng,
        });
      } catch (error) {
        console.error("更新文件位置失败:", error);
        return; // 如果更新失败，不更新本地状态
      }
    }

    // API 更新成功后，再更新本地状态
    setUnifiedMediaItems((prev) =>
      prev.map((i) => {
        if (i.id !== itemId) return i;

        if (i.type === "existing") {
          return {
            ...i,
            data: {
              ...i.data,
              lat: location.lat,
              lng: location.lng,
            },
          } as ExistingMediaItem;
        }

        return {
          ...i,
          data: {
            ...i.data,
            lat: location.lat,
            lng: location.lng,
          },
        } as NewMediaItem;
      }),
    );
  };

  // 重置
  const reset = () => {
    setSelectedFiles([]);
    setUnifiedMediaItems([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // 暴露重置方法
  React.useImperativeHandle(React.useRef<{ reset: () => void }>(null), () => ({
    reset,
  }));

  return (
    <div className="space-y-4">
      <div>
        <label className="font-medium text-gray-700 text-sm">图片/视频（可选）</label>
      </div>

      {/* 上传区域 */}
      <div
        className={`rounded-xl border-2 border-dashed p-4 text-center transition-all ${
          isDragging
            ? "border-black bg-gray-100"
            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
        } ${disabled ? "pointer-events-none opacity-50" : ""}`}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <label className="group block cursor-pointer" htmlFor="media-upload">
          <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 transition-colors group-hover:bg-gray-200">
            <Image className="text-gray-400" size={14} />
          </div>
          <p className="text-gray-600 text-xs">点击或拖拽上传图片/视频</p>
          <p className="text-gray-400 text-xs">支持 JPG、PNG、MP4 等格式，单文件需要小于 20MB</p>
        </label>
        <input
          accept="image/*,video/*"
          className="hidden"
          disabled={disabled}
          id="media-upload"
          multiple
          onChange={handleFileChange}
          ref={fileInputRef}
          type="file"
        />
      </div>

      {/* 媒体预览网格 */}
      {unifiedMediaItems.length > 0 && (
        <>
          <div className="max-h-[300px] overflow-y-auto rounded-lg border border-gray-200 p-2">
            <DndContext
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              sensors={sensors}
            >
              <SortableContext
                items={unifiedMediaItems.map((item) => item.id)}
                strategy={rectSortingStrategy}
              >
                <div className="grid grid-cols-3 gap-2">
                  {unifiedMediaItems.map((item) => (
                    <UnifiedSortableMediaItem
                      item={item}
                      key={item.id}
                      onRemove={() => handleRemoveMediaItem(item.id)}
                      onLocationAdd={handleLocationAdd}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>

          {/* 地理位置说明 */}
          <div className="flex items-start gap-2 text-xs text-gray-500 mt-2">
            <p>
              <MapPin size={12} className="inline mx-0.5 -mt-0.5" />
              表示该图片已添加地理位置信息，点击可进行修改；如果图片没有添加地理位置信息，
              可悬浮到对应图片上，点击“添加位置”进行编辑，相关信息会用于您的轨迹统计。
            </p>
          </div>
        </>
      )}
    </div>
  );
}
