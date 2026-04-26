import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import type { MediaCarouselRef } from "@/components/media/MediaCarousel";
import MediaCarousel from "@/components/media/MediaCarousel";
import type { PostImage } from "@/types";

async function fetchTopic(secUid: string) {
  const token = localStorage.getItem("auth_token") || "";
  const res = await fetch(`http://localhost:9527/api/v1/topics/${secUid}`, {
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
  });
  const data = await res.json();
  const topic = data.data;
  const files: PostImage[] = (topic.files || []).map((f: any) => ({
    id: f.sec_uid || f.id,
    name: f.name || "",
    type: f.type || "image/jpeg",
    url: f.url,
    width: f.width || 0,
    height: f.height || 0,
    blurhash: f.blurhash || "",
    videoSrc: f.live_photo_video?.url || null,
  }));
  return { title: topic.title as string, images: files };
}

function TestCarouselPage() {
  const [images, setImages] = useState<PostImage[]>([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<MediaCarouselRef>(null);

  useEffect(() => {
    fetchTopic("h8-Jv4np_KCfeteIfVJ9Ow")
      .then((result) => {
        setTitle(result.title);
        setImages(result.images);
        setLoading(false);
      })
      .catch((err) => {
        console.error("[carousel] fetch error:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex h-screen flex-col bg-black">
      <div className="flex items-center gap-4 border-gray-800 border-b p-4">
        <span className="font-bold text-white">Carousel 调试</span>
        {title && <span className="text-gray-400 text-sm">{title}</span>}
        <span className="text-gray-500 text-xs">
          {currentIndex + 1} / {images.length}
        </span>
      </div>

      <div className="flex-1 overflow-hidden">
        {loading && (
          <div className="flex h-full items-center justify-center text-white">加载中...</div>
        )}

        {!loading && images.length > 0 && (
          <div className="relative flex h-full flex-1 items-center justify-center overflow-hidden bg-black">
            <MediaCarousel images={images} onIndexChange={setCurrentIndex} ref={carouselRef} />
          </div>
        )}
      </div>
    </div>
  );
}

export const Route = createFileRoute("/test-carousel")({
  component: TestCarouselPage,
});
