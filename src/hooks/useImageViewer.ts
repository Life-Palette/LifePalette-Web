import { createElement, useCallback, useEffect, useRef, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { type ImageObj, type ViewerItem, ViewerPro, type ViewerProOptions } from "viewer-pro";
import ImageInfoPanel from "@/components/media/ImageInfoPanel";
import type { PostImage } from "@/types";
import { isVideo } from "@/utils/media";

export type { ImageObj, ViewerProOptions };

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

  // 自定义渲染节点
  const createCustomRenderNode = useCallback((imgObj: ImageObj, idx: number) => {
    const box = document.createElement("div");
    box.id = `custom-render-${idx}`;
    box.style.display = "flex";
    box.style.flexDirection = "column";
    box.style.alignItems = "center";
    box.style.justifyContent = "center";
    box.style.height = "100%";
    box.style.transformOrigin = "center center";
    box.style.willChange = "transform";
    if (imgObj.type === "live-photo") {
      box.innerHTML = `
        <div id="live-photo-container-${idx}"></div>
         `;
    } else if (imgObj.type === "video") {
      box.innerHTML = `
          <video 
            src="${imgObj.videoSrc || imgObj.src}"
            poster="${imgObj.thumbnail || ""}" 
            controls 
            style="max-width:90%;max-height:90%;"
            preload="metadata"
          >
            您的浏览器不支持视频播放
          </video>
        `;
    } else {
      box.innerHTML = `
          <img src="${imgObj.src}" style="max-width:90%;max-height:90%;">
        `;
    }

    return box;
  }, []);

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
      onImageLoad: initialOptions.onImageLoad || ((_imgObj: ImageObj, _idx: number) => {}),
      infoRender: initialOptions.infoRender || createCustomInfoNode,
    };

    viewerRef.current = new ViewerPro(viewerOptions);
    viewerRef.current.init();
  }, [images, initialOptions, createCustomLoadingNode, createCustomRenderNode]);

  // 打开图片预览
  const openPreview = useCallback(
    (index: number) => {
      if (viewerRef.current && index >= 0 && index < images.length) {
        viewerRef.current.open(index);
      }
    },
    [images.length],
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
    [images],
  );

  // 打开指定 URL 的图片
  const openImageBySrc = useCallback(
    (src: string) => {
      const index = findImageIndex(src);
      if (index !== -1) {
        openPreview(index);
      }
    },
    [findImageIndex, openPreview],
  );

  // 从 PostImage 数组转换为 ImageObj 数组
  const convertPostImagesToImageObj = useCallback((postImages: any[]): any[] => {
    return postImages.map((file) => {
      // 检测是否为视频文件
      const isVideoFile = isVideo(file);

      return {
        ...file,
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
    [convertPostImagesToImageObj, updateImages],
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
    [],
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
