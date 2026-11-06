import { registerComponents } from "@eosjs/ui";
import { useCallback, useEffect, useMemo, useRef } from "react";
import type { PostImage } from "@/types";
import {
  generateOssImageParams,
  getVideoThumbnailUrl,
  isVideo,
} from "@/utils/media";

registerComponents();

interface ImageGalleryProps {
  className?: string;
  images: PostImage[];
  maxDisplay?: number;
  onImageClick?: (index: number, e: React.MouseEvent) => void;
  prioritizeFirstImage?: boolean;
}

interface ImageGroupItem {
  alt: string;
  loading: "eager" | "lazy";
  objectFit: "cover";
  placeholder?: string;
  placeholderFill?: boolean;
  placeholderType?: "blurhash";
  src: string;
}

type ImageGroupElement = HTMLElement & {
  items: ImageGroupItem[];
  layout: "featured" | "grid" | "pair";
  maxVisible: number;
};

type ImageGroupClickEvent = CustomEvent<{
  index: number;
  item: ImageGroupItem;
}>;

function getDisplayUrl(image: PostImage) {
  if (isVideo(image)) {
    return getVideoThumbnailUrl(image.url);
  }

  const isGif =
    image.type === "image/gif" || image.url.toLowerCase().endsWith(".gif");
  if (isGif) {
    return image.url;
  }

  return `${image.url}${generateOssImageParams(image.width, image.height, 400, 60)}`;
}

export default function ImageGallery({
  images,
  maxDisplay = 9,
  className = "",
  onImageClick,
  prioritizeFirstImage = false,
}: ImageGalleryProps) {
  const groupRef = useRef<ImageGroupElement>(null);

  const items = useMemo<ImageGroupItem[]>(
    () =>
      images.map((image, index) => ({
        alt: image.name,
        loading: index === 0 && prioritizeFirstImage ? "eager" : "lazy",
        objectFit: "cover",
        placeholder: image.blurhash || undefined,
        placeholderFill: Boolean(image.blurhash),
        placeholderType: image.blurhash ? "blurhash" : undefined,
        src: getDisplayUrl(image),
      })),
    [images, prioritizeFirstImage]
  );

  const handleImageClick = useCallback(
    (event: Event) => {
      event.stopPropagation();
      const { index } = (event as ImageGroupClickEvent).detail;
      onImageClick?.(index, event as unknown as React.MouseEvent);
    },
    [onImageClick]
  );

  useEffect(() => {
    const group = groupRef.current;
    if (!group) {
      return;
    }

    group.addEventListener("image-click", handleImageClick);
    return () => group.removeEventListener("image-click", handleImageClick);
  }, [handleImageClick]);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) {
      return;
    }

    group.items = items;
    group.layout = "grid";
    group.maxVisible = maxDisplay;
  }, [items, maxDisplay]);

  if (images.length === 0) {
    return null;
  }

  return (
    <div className={`relative w-full ${className}`}>
      <eos-image-group ref={groupRef} />
    </div>
  );
}
