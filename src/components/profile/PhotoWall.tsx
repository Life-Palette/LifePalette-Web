import { useQueryClient } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Eye, EyeOff, Info, MoreVertical, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { LottieAnimation } from "@/components/lottie";
import ImagePreview from "@/components/media/ImagePreview";
import OptimizedImage from "@/components/media/OptimizedImage";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { queryKeys } from "@/constants/query-keys";
import {
  type UserFileImage,
  useDeleteFile,
  useInfiniteUserFiles,
  useUpdateFileVisibility,
} from "@/hooks/useUserFiles";
import PhotoWallUploader from "./PhotoWallUploader";

// 网格列数配置
const COLUMNS = 6;

interface PhotoWallProps {
  userId?: number;
  isOwnProfile?: boolean; // 是否是自己的个人中心
  onImageClick?: (image: UserFileImage, index: number) => void;
}

export default function PhotoWall({ userId, isOwnProfile = false, onImageClick }: PhotoWallProps) {
  const [deleteTarget, setDeleteTarget] = useState<UserFileImage | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const {
    data: filesData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteUserFiles(userId, {
    size: 30,
    sort: "createdAt,desc",
    filterEmptyLocation: false,
  });

  const updateVisibilityMutation = useUpdateFileVisibility();
  const deleteFileMutation = useDeleteFile();

  const photos = filesData?.pages.flatMap((page) => page.items) || [];
  const parentRef = useRef<HTMLDivElement>(null);

  // 将照片按行分组
  const rows = useMemo(() => {
    const result: UserFileImage[][] = [];
    for (let i = 0; i < photos.length; i += COLUMNS) {
      result.push(photos.slice(i, i + COLUMNS));
    }
    return result;
  }, [photos]);

  // 虚拟列表配置
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120, // 估算每行高度
    overscan: 3,
  });

  // 监听滚动到底部，触发加载更多
  const virtualItems = virtualizer.getVirtualItems();
  const lastItem = virtualItems[virtualItems.length - 1];

  useEffect(() => {
    if (!lastItem) return;
    // 当滚动到最后3行时，触发加载更多
    if (lastItem.index >= rows.length - 3 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [lastItem, rows.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleImageClick = useCallback(
    (image: UserFileImage, index: number) => {
      if (onImageClick) {
        onImageClick(image, index);
      } else {
        // 打开预览
        setPreviewIndex(index);
        setPreviewOpen(true);
      }
    },
    [onImageClick],
  );

  // 切换可见性
  const handleToggleVisibility = useCallback(
    async (photo: UserFileImage, e: React.MouseEvent) => {
      e.stopPropagation();
      try {
        await updateVisibilityMutation.mutateAsync({
          fileId: photo.id,
          isPrivate: !photo.isPrivate,
        });
        toast.success(photo.isPrivate ? "已设为公开" : "已设为仅自己可见");
      } catch (error) {
        toast.error("操作失败，请重试");
      }
    },
    [updateVisibilityMutation],
  );

  // 确认删除
  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await deleteFileMutation.mutateAsync({ fileId: deleteTarget.id });
      toast.success("删除成功");
      setDeleteTarget(null);
    } catch (error) {
      toast.error("删除失败，请重试");
    }
  }, [deleteTarget, deleteFileMutation]);

  // 上传成功回调
  const handleUploadSuccess = useCallback(() => {
    // 刷新文件列表
    queryClient.invalidateQueries({ queryKey: queryKeys.files.all });
  }, [queryClient]);

  if (isLoading && photos.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <LottieAnimation
        type="empty"
        emptyTitle="还没有照片"
        emptyDescription="上传的照片将会在这里展示"
        width={200}
        height={200}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* 照片统计和上传按钮 */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          共 <span className="font-medium text-foreground">{filesData?.pages[0]?.total || 0}</span>{" "}
          张照片
        </p>
        {isOwnProfile && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setUploadDialogOpen(true)}
            className="gap-1.5"
          >
            <Plus size={14} />
            上传图片
          </Button>
        )}
      </div>

      {/* 隐私说明 */}
      {isOwnProfile && (
        <div className="flex items-start gap-2 rounded-lg border border-border/50 bg-muted/30 p-3">
          <Info size={16} className="mt-0.5 shrink-0 text-muted-foreground" />
          <div className="text-muted-foreground text-xs leading-relaxed">
            <p>
              非动态发布上传的文件默认为
              <span className="mx-1 inline-flex items-center gap-0.5 rounded bg-black/10 px-1 py-0.5 dark:bg-white/10">
                <EyeOff size={10} />
                仅自己
              </span>
              状态，该状态下的文件将不纳入「色集」与「轨迹」的数据统计，且对其他用户不可见。
            </p>
            <p className="mt-1">若需公开展示或参与统计，请在文件菜单中手动调整可见性设置。</p>
          </div>
        </div>
      )}

      {/* 虚拟列表容器 */}
      <div ref={parentRef} className="h-[calc(100vh-280px)] overflow-auto">
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const rowPhotos = rows[virtualRow.index];
            return (
              <div
                key={virtualRow.key}
                data-index={virtualRow.index}
                ref={virtualizer.measureElement}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                className="grid grid-cols-3 gap-1 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 pb-1"
              >
                {rowPhotos.map((photo) => {
                  const globalIndex = photos.findIndex((p) => p.id === photo.id);
                  return (
                    <div
                      key={photo.id}
                      className="group relative aspect-square cursor-pointer overflow-hidden rounded-md bg-muted transition-all hover:z-10 hover:shadow-lg"
                      onClick={() => handleImageClick(photo, globalIndex)}
                    >
                      <OptimizedImage
                        image={photo}
                        className="h-full w-full transition-transform duration-300 group-hover:scale-105"
                        objectFit="cover"
                        loading="lazy"
                      />
                      {/* 私密标识 */}
                      {photo.isPrivate && (
                        <div className="absolute top-1.5 left-1.5 z-10 flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 backdrop-blur-sm">
                          <EyeOff size={10} className="text-white/90" />
                          <span className="text-[10px] text-white/90">仅自己</span>
                        </div>
                      )}
                      {/* 悬停遮罩 */}
                      <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
                      {isOwnProfile && (
                        <div className="absolute top-1 right-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              className="rounded bg-black/60 p-1 hover:bg-black/80"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical size={14} className="text-white" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={(e) => handleToggleVisibility(photo, e)}>
                                {photo.isPrivate ? (
                                  <>
                                    <Eye size={14} className="mr-2" />
                                    设为公开
                                  </>
                                ) : (
                                  <>
                                    <EyeOff size={14} className="mr-2" />
                                    设为仅自己可见
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteTarget(photo);
                                }}
                              >
                                <Trash2 size={14} className="mr-2" />
                                删除
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* 加载状态 */}
        {isFetchingNextPage && (
          <div className="flex items-center justify-center py-4">
            <LoadingSpinner size="sm" />
          </div>
        )}
        {!hasNextPage && photos.length > 0 && (
          <div className="py-4 text-center text-muted-foreground text-sm">已加载全部照片</div>
        )}
      </div>

      {/* 删除确认对话框 */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.hasTopic ? (
                <span className="text-destructive">
                  ⚠️ 此照片已被文章引用，删除后相关文章中的图片将无法显示。确定要删除吗？
                </span>
              ) : (
                "确定要删除这张照片吗？此操作无法撤销。"
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteFileMutation.isPending ? "删除中..." : "确认删除"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 图片预览 */}
      <ImagePreview
        images={photos}
        initialIndex={previewIndex}
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
      />

      {/* 上传对话框 */}
      {isOwnProfile && (
        <PhotoWallUploader
          open={uploadDialogOpen}
          onOpenChange={setUploadDialogOpen}
          onUploadSuccess={handleUploadSuccess}
        />
      )}
    </div>
  );
}
