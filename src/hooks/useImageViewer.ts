import { decode } from "blurhash";
import { createElement, useCallback, useEffect, useRef, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { type ImageObj, type ViewerItem, ViewerPro, type ViewerProOptions } from "viewer-pro";
import ImageInfoPanel from "@/components/media/ImageInfoPanel";
import type { PostImage } from "@/types";
import { isVideo } from "@/utils/media";

export type { ImageObj, ViewerProOptions } from "viewer-pro";

export function useImageViewer(initialOptions: ViewerProOptions = {}) {
  const [images, setImages] = useState<ImageObj[]>(initialOptions.images || []);
  const viewerRef = useRef<ViewerPro | null>(null);
  const renderedContainers = useRef(new Map<number, HTMLElement>());
  const renderedRoots = useRef(new Map<number, Root>());

  // 自定义加载节点
  const createCustomLoadingNode = useCallback(() => {
    const customLoading = document.createElement("div");
    customLoading.innerHTML = `
      <div style="color: #fff; font-size: 18px; display: flex; flex-direction: column; align-items: center;">
        <svg width="32" height="32" viewBox="0 0 50 50">
          <circle 
            cx="25" 
            cy="25" 
            r="20" 
            fill="none" 
            stroke="#3B82F6" 
            stroke-width="5" 
            stroke-linecap="round" 
            stroke-dasharray="31.4 31.4" 
            transform="rotate(-90 25 25)"
          >
            <animateTransform 
              attributeName="transform" 
              type="rotate" 
              from="0 25 25" 
              to="360 25 25" 
              dur="1s" 
              repeatCount="indefinite"
            />
          </circle>
        </svg>
        <span>图片加载中，请稍候...</span>
      </div>
    `;
    return customLoading;
  }, []);

  // 自定义信息渲染节点
  const createCustomInfoNode = useCallback((viewerItem: ViewerItem, idx: number) => {
    // 清理之前的容器（如果存在）
    const oldRoot = renderedRoots.current.get(idx);
    if (oldRoot) {
      oldRoot.unmount();
      renderedRoots.current.delete(idx);
    }

    // 创建一个新的容器元素
    const container = document.createElement("div");
    container.id = `custom-info-${idx}`;
    container.style.width = "100%";
    container.style.height = "100%";

    // 使用 React 18 的 createRoot 渲染组件
    const root = createRoot(container);
    root.render(createElement(ImageInfoPanel, { viewerItem, index: idx }));

    // 保存容器和 root 引用以便后续清理
    renderedContainers.current.set(idx, container);
    renderedRoots.current.set(idx, root);

    return container;
  }, []);

  // 创建 blurhash canvas 占位图
  const createBlurhashCanvas = useCallback((hash?: string): HTMLCanvasElement | null => {
    if (!hash) return null;
    const width = 32;
    const height = 32;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    canvas.width = width;
    canvas.height = height;
    canvas.style.position = "absolute";
    canvas.style.inset = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.objectFit = "cover";
    canvas.style.transition = "opacity 240ms ease";
    try {
      const pixels = decode(hash, width, height);
      const imageData = ctx.createImageData(width, height);
      imageData.data.set(pixels);
      ctx.putImageData(imageData, 0, 0);
    } catch {
      return null;
    }
    return canvas;
  }, []);

  // 根据图片宽高比计算 frame 尺寸
  const applyImageFrameSize = useCallback((frame: HTMLElement, imgObj: ImageObj) => {
    const w = Number(imgObj.width);
    const h = Number(imgObj.height);
    const ratio = w > 0 && h > 0 ? w / h : 1;
    requestAnimationFrame(() => {
      const parent = frame.parentElement;
      if (!parent) return;
      const maxWidth = parent.clientWidth * 0.9;
      const maxHeight = parent.clientHeight * 0.9;
      let frameWidth = maxWidth;
      let frameHeight = frameWidth / ratio;
      if (frameHeight > maxHeight) {
        frameHeight = maxHeight;
        frameWidth = frameHeight * ratio;
      }
      frame.style.width = `${frameWidth}px`;
      frame.style.height = `${frameHeight}px`;
    });
  }, []);

  // 自定义渲染节点（含 blurhash 占位）
  const createCustomRenderNode = useCallback((imgObj: ImageObj, idx: number) => {
    const box = document.createElement("div");
    box.id = `custom-render-${idx}`;
    box.style.display = "flex";
    box.style.alignItems = "center";
    box.style.justifyContent = "center";
    box.style.height = "100%";
    box.style.transformOrigin = "center center";
    box.style.willChange = "transform";

    const contentLayer = document.createElement("div");
    contentLayer.id = `custom-render-content-${idx}`;
    contentLayer.style.position = "relative";
    contentLayer.style.zIndex = "1";
    contentLayer.style.display = "flex";
    contentLayer.style.alignItems = "center";
    contentLayer.style.justifyContent = "center";
    contentLayer.style.width = "100%";
    contentLayer.style.height = "100%";
    contentLayer.style.transformOrigin = "center center";
    contentLayer.style.willChange = "transform";

    const createImageFrame = () => {
      const imageFrame = document.createElement("div");
      imageFrame.style.position = "relative";
      imageFrame.style.flex = "0 0 auto";
      const placeholder = createBlurhashCanvas((imgObj as any).blurhash);
      if (placeholder) {
        imageFrame.appendChild(placeholder);
      }
      applyImageFrameSize(imageFrame, imgObj);
      return { imageFrame, placeholder };
    };

    if (imgObj.type === "live-photo") {
      const { imageFrame, placeholder } = createImageFrame();
      const livePhotoContainer = document.createElement("div");
      livePhotoContainer.id = `live-photo-container-${idx}`;
      livePhotoContainer.style.position = "absolute";
      livePhotoContainer.style.inset = "0";
      livePhotoContainer.style.width = "100%";
      livePhotoContainer.style.height = "100%";
      livePhotoContainer.style.zIndex = "1";
      livePhotoContainer.dataset.placeholderId = `blurhash-placeholder-${idx}`;
      if (placeholder) {
        placeholder.id = `blurhash-placeholder-${idx}`;
      }
      imageFrame.appendChild(livePhotoContainer);
      contentLayer.appendChild(imageFrame);
    } else if (imgObj.type === "video") {
      const { imageFrame, placeholder } = createImageFrame();
      const video = document.createElement("video");
      video.src = imgObj.videoSrc || imgObj.src;
      video.poster = imgObj.thumbnail || "";
      video.controls = true;
      video.preload = "metadata";
      video.style.width = "100%";
      video.style.height = "100%";
      video.style.objectFit = "contain";
      video.style.position = "absolute";
      video.style.inset = "0";
      video.style.zIndex = "1";
      video.textContent = "您的浏览器不支持视频播放";
      video.addEventListener("loadeddata", () => {
        if (placeholder) placeholder.remove();
      }, { once: true });
      imageFrame.appendChild(video);
      contentLayer.appendChild(imageFrame);
    } else {
      const { imageFrame, placeholder } = createImageFrame();
      const image = document.createElement("img");
      image.src = imgObj.src;
      image.alt = (imgObj as any).title || "";
      image.style.width = "100%";
      image.style.height = "100%";
      image.style.objectFit = "contain";
      image.style.position = "absolute";
      image.style.inset = "0";
      image.style.zIndex = "1";
      image.style.opacity = placeholder ? "0" : "1";
      image.style.transition = "opacity 240ms ease";
      image.addEventListener("load", () => {
        image.style.opacity = "1";
        if (placeholder) placeholder.remove();
      }, { once: true });
      imageFrame.appendChild(image);
      contentLayer.appendChild(imageFrame);
    }

    box.appendChild(contentLayer);
    return box;
  }, [createBlurhashCanvas, applyImageFrameSize]);

  // 初始化图片查看器
  const initViewer = useCallback(async () => {
    if (images.length === 0) {
      return;
    }

    // 销毁旧的实例
    if (viewerRef.current) {
      viewerRef.current.close();
      viewerRef.current = null;
    }

    const viewerOptions: ViewerProOptions = {
      images,
      loadingNode: initialOptions.loadingNode || createCustomLoadingNode(),
      renderNode: initialOptions.renderNode || createCustomRenderNode,
      onImageLoad: initialOptions.onImageLoad || ((_imgObj: ImageObj, _idx: number) => { }),
      infoRender: initialOptions.infoRender || createCustomInfoNode,
    };

    viewerRef.current = new ViewerPro(viewerOptions);
    viewerRef.current.init();
  }, [
    images,
    initialOptions,
    createCustomLoadingNode,
    createCustomRenderNode,
    createCustomInfoNode,
  ]);

  // 打开图片预览
  const openPreview = useCallback(
    (index: number) => {
      if (viewerRef.current && index >= 0 && index < images.length) {
        viewerRef.current.open(index);
      }
    },
    [images.length]
  );

  // 关闭图片预览
  const closePreview = useCallback(() => {
    if (viewerRef.current) {
      viewerRef.current.close();
    }
  }, []);

  // 添加图片
  const addImages = useCallback((newImages: ImageObj[]) => {
    setImages((prev) => [...prev, ...newImages]);
    if (viewerRef.current) {
      viewerRef.current.addImages(newImages);
    }
  }, []);

  // 设置图片列表
  const updateImages = useCallback((newImages: ImageObj[]) => {
    setImages(newImages);
  }, []);

  // 根据图片 URL 查找索引
  const findImageIndex = useCallback(
    (src: string) => images.findIndex((img) => img.src === src),
    [images]
  );

  // 打开指定 URL 的图片
  const openImageBySrc = useCallback(
    (src: string) => {
      const index = findImageIndex(src);
      if (index !== -1) {
        openPreview(index);
      }
    },
    [findImageIndex, openPreview]
  );

  // 从 PostImage 数组转换为 ImageObj 数组
  const convertPostImagesToImageObj = useCallback((postImages: any[]): any[] => {
    return postImages.map((file) => {
      // 检测是否为视频文件
      const isVideoFile = isVideo(file);

      return {
        ...file,
        id: file.sec_uid,
        src: file.url,
        thumbnail: isVideoFile
          ? `${file.url}?x-oss-process=video/snapshot,t_1000,f_jpg,w_0,h_0,m_fast`
          : `${file.url}?x-oss-process=image/resize,w_300,h_200,m_lfit/quality,q_10/format,webp`,
        title: file.name,
        // 如果是视频文件,设置 videoSrc 和 type
        videoSrc: isVideoFile ? file.url : file.videoSrc,
        type: isVideoFile ? "video" : file.videoSrc ? "live-photo" : file.type,
      };
    });
  }, []);

  // 使用 PostImage 初始化查看器
  const initWithPostImages = useCallback(
    (postImages: PostImage[]) => {
      const imageObjs = convertPostImagesToImageObj(postImages);
      updateImages(imageObjs);
    },
    [convertPostImagesToImageObj, updateImages]
  );

  // 初始化和清理
  useEffect(() => {
    if (images.length > 0) {
      initViewer();
    }
  }, [images, initViewer]);

  useEffect(
    () => () => {
      if (viewerRef.current) {
        viewerRef.current.close();
        viewerRef.current = null;
      }
      // 清理所有渲染的 React 组件
      renderedRoots.current.forEach((root) => root.unmount());
      renderedRoots.current.clear();
      renderedContainers.current.clear();
    },
    []
  );

  return {
    viewer: viewerRef.current,
    images,
    openPreview,
    closePreview,
    addImages,
    updateImages,
    findImageIndex,
    openImageBySrc,
    initViewer,
    convertPostImagesToImageObj,
    initWithPostImages,
  };
}
