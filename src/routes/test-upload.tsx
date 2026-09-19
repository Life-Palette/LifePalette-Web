/* biome-ignore-all lint/a11y/noNoninteractiveElementInteractions: this existing integration requires the current implementation */
/* biome-ignore-all lint/style/noNestedTernary: this existing integration requires the current implementation */
/* biome-ignore-all lint/performance/noJsxPropsBind: upload demo callbacks intentionally capture test state */

import { createFileRoute } from "@tanstack/react-router";
import {
  CheckCircle2,
  FileImage,
  LoaderCircle,
  MapPin,
  Upload,
  X,
} from "lucide-react";
import { type ChangeEvent, type DragEvent, useMemo, useState } from "react";
import { useFileUpload } from "@/hooks/use-file-upload";
import { DEFAULT_UPLOAD_OPTIONS, type OSSFile } from "@/services/upload";
import {
  extractGPSFromImage,
  type GPSCoordinates,
} from "@/utils/upload/gps-extractor";

interface SelectedFile {
  file: File;
  gps: GPSCoordinates | null;
  id: string;
  readingGPS: boolean;
}

function TestUploadPage() {
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<OSSFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const { uploadMultipleFiles, uploadState } = useFileUpload();

  const locationMap = useMemo(() => {
    const map = new Map<File, GPSCoordinates>();
    for (const item of selectedFiles) {
      if (item.gps) {
        map.set(item.file, item.gps);
      }
    }
    return map;
  }, [selectedFiles]);

  const addFiles = async (files: File[]) => {
    const accepted = files.filter(
      (file) => file.type.startsWith("image/") || file.type.startsWith("video/")
    );
    const entries = accepted.map((file, index) => ({
      file,
      gps: null,
      id: `${file.name}-${file.lastModified}-${index}`,
      readingGPS: file.type.startsWith("image/"),
    }));
    setUploadedFiles([]);
    setSelectedFiles((current) => [...current, ...entries]);

    const gpsResults = await Promise.all(
      entries.map((entry) =>
        entry.readingGPS
          ? extractGPSFromImage(entry.file)
          : Promise.resolve(null)
      )
    );
    setSelectedFiles((current) =>
      current.map((item) => {
        const index = entries.findIndex((entry) => entry.id === item.id);
        return index === -1
          ? item
          : { ...item, gps: gpsResults[index], readingGPS: false };
      })
    );
  };

  const handleInputChange = async (event: ChangeEvent<HTMLInputElement>) => {
    await addFiles(Array.from(event.target.files || []));
    event.target.value = "";
  };

  const handleDrop = async (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    await addFiles(Array.from(event.dataTransfer.files));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0 || uploadState.isUploading) {
      return;
    }
    setUploadedFiles([]);
    const results = await uploadMultipleFiles(
      selectedFiles.map((item) => item.file),
      DEFAULT_UPLOAD_OPTIONS,
      locationMap
    );
    setUploadedFiles(results);
  };

  const removeFile = (id: string) => {
    setSelectedFiles((current) => current.filter((item) => item.id !== id));
    setUploadedFiles([]);
  };

  const isComplete =
    uploadState.stage === "complete" && !uploadState.isUploading;

  return (
    <main className="min-h-screen bg-[#f6f7f8] px-4 py-8 text-[#1f2933] sm:px-8">
      <div className="mx-auto max-w-4xl">
        <header className="border-[#d9dee3] border-b pb-5">
          <p className="text-[#64748b] text-sm">本地测试</p>
          <h1 className="mt-2 font-semibold text-2xl tracking-tight">
            上传组件测试
          </h1>
          <p className="mt-2 text-[#64748b] text-sm">
            测试文件选择、媒体分析、EXIF GPS 读取和上传完成接口。
          </p>
        </header>

        <section
          aria-labelledby="select-heading"
          className="mt-6 rounded-lg border border-[#d9dee3] bg-white"
        >
          <div className="border-[#e5e7eb] border-b px-5 py-4">
            <h2 className="font-medium text-base" id="select-heading">
              选择文件
            </h2>
            <p className="mt-1 text-[#64748b] text-sm">
              支持 JPG、PNG、MP4、MOV，图片超过 20MB 会自动压缩，视频需小于 20MB。
            </p>
          </div>

          <div className="p-5">
            <label
              className={`flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed px-4 text-center transition-colors focus-within:outline-2 focus-within:outline-[#2563eb] focus-within:outline-offset-2 ${isDragging ? "border-[#2563eb] bg-[#eff6ff]" : "border-[#b8c1cc] bg-[#fafafa] hover:border-[#64748b] hover:bg-[#f8fafc]"}`}
              onDragEnter={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleDrop}
            >
              <input
                accept="image/*,video/*"
                className="sr-only"
                multiple
                onChange={handleInputChange}
                type="file"
              />
              <Upload
                aria-hidden="true"
                className="h-6 w-6 text-[#64748b]"
                strokeWidth={1.7}
              />
              <span className="mt-3 font-medium text-sm">
                点击选择文件，或将文件拖到这里
              </span>
              <span className="mt-1 text-[#64748b] text-xs">
                文件只会先在浏览器读取元数据
              </span>
            </label>

            {selectedFiles.length > 0 && (
              <div aria-live="polite" className="mt-4 space-y-2">
                {selectedFiles.map((item) => (
                  <div
                    className="flex items-center gap-3 rounded-md border border-[#e5e7eb] px-3 py-3"
                    key={item.id}
                  >
                    <FileImage
                      aria-hidden="true"
                      className="h-5 w-5 shrink-0 text-[#64748b]"
                      strokeWidth={1.7}
                    />
                    <div className="min-w-0 flex-1">
                      <p
                        className="truncate font-medium text-sm"
                        title={item.file.name}
                      >
                        {item.file.name}
                      </p>
                      <p className="mt-1 text-[#64748b] text-xs">
                        {item.readingGPS
                          ? "正在读取 GPS…"
                          : item.gps
                            ? `GPS：${item.gps.lat.toFixed(6)}, ${item.gps.lng.toFixed(6)}`
                            : "未读取到 GPS"}
                      </p>
                    </div>
                    <button
                      aria-label={`移除 ${item.file.name}`}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#b42318] focus-visible:outline-2 focus-visible:outline-[#2563eb]"
                      onClick={() => removeFile(item.id)}
                      type="button"
                    >
                      <X aria-hidden="true" className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section
          aria-labelledby="upload-heading"
          className="mt-5 rounded-lg border border-[#d9dee3] bg-white"
        >
          <div className="flex flex-col gap-4 border-[#e5e7eb] border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-medium text-base" id="upload-heading">
                执行上传
              </h2>
              <p className="mt-1 text-[#64748b] text-sm">
                上传时会把读取到的经纬度一并发送给服务端。
              </p>
            </div>
            <button
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-[#2563eb] px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-[#1d4ed8] focus-visible:outline-2 focus-visible:outline-[#2563eb] focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:bg-[#cbd5e1]"
              disabled={selectedFiles.length === 0 || uploadState.isUploading}
              onClick={handleUpload}
              type="button"
            >
              {uploadState.isUploading ? (
                <LoaderCircle
                  aria-hidden="true"
                  className="h-4 w-4 animate-spin"
                />
              ) : isComplete ? (
                <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
              ) : null}
              {uploadState.isUploading
                ? "上传中…"
                : isComplete
                  ? "已完成"
                  : "开始上传"}
            </button>
          </div>

          <div className="grid divide-y divide-[#e5e7eb] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <Status label="进度" value={`${uploadState.progress}%`} />
            <Status label="阶段" value={uploadState.stageText || "等待选择"} />
            <Status label="接口" value="/file/upload/complete" />
          </div>

          {!!uploadState.error && (
            <div
              className="m-5 rounded-md border border-[#f1b8b2] bg-[#fff5f4] p-4 text-[#b42318]"
              role="alert"
            >
              <p className="font-medium text-sm">上传失败</p>
              <p className="mt-1 text-xs">{uploadState.error.message}</p>
            </div>
          )}
          {uploadedFiles.length > 0 && (
            <div className="m-5 rounded-md border border-[#b7dec8] bg-[#f2fbf5] p-4">
              <p className="font-medium text-[#166534] text-sm">服务端返回</p>
              {uploadedFiles.map((file) => (
                <div className="mt-3 flex gap-2 text-sm" key={file.sec_uid}>
                  <MapPin
                    aria-hidden="true"
                    className="mt-0.5 h-4 w-4 shrink-0 text-[#166534]"
                  />
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="mt-1 text-[#166534] text-xs">
                      {file.address || "服务端未返回地址"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function Status({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-h-20 p-4">
      <p className="text-[#64748b] text-xs">{label}</p>
      <p className="mt-2 truncate font-medium text-sm" title={value}>
        {value}
      </p>
    </div>
  );
}

export const Route = createFileRoute("/test-upload")({
  component: TestUploadPage,
});
