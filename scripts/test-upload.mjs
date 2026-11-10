import assert from "node:assert/strict";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  createUploader,
  detectLivePhotoPairs,
} from "@life-palette/uploader/web";
import { build } from "vite";

const STORAGE_FAILURE = /503/;

const bundle = await build({
  build: {
    lib: {
      entry: fileURLToPath(
        new URL("../src/services/upload/index.ts", import.meta.url)
      ),
      formats: ["cjs"],
    },
    rolldownOptions: {
      external: [
        "@life-palette/media",
        "@life-palette/uploader/web",
        "@/config/env",
        "@/services/api",
      ],
    },
    write: false,
  },
  configFile: false,
  logLevel: "silent",
  resolve: {
    alias: { "@": fileURLToPath(new URL("../src", import.meta.url)) },
  },
});
const outputText = bundle[0].output.find((item) => item.type === "chunk").code;

function setup({ failUpload = false, exif = { device_make: "camera" } } = {}) {
  const requests = [];
  const links = [];
  const analyzedFiles = [];
  const fetch = (url, init) => {
    const body =
      typeof init.body === "string" ? JSON.parse(init.body) : init.body;
    requests.push({ body, method: init.method, url });
    if (url === "https://storage.test/file") {
      return Promise.resolve(
        new Response(null, { status: failUpload ? 503 : 200 })
      );
    }
    if (url.endsWith("/complete")) {
      return Promise.resolve(
        Response.json({
          data: {
            is_private: body.is_private,
            name: "photo.jpg",
            size: 3,
            type: "image/jpeg",
            uid: "file-uid",
            url: "https://storage.test/file",
          },
        })
      );
    }
    assert.equal(url, "https://api.test/api/v1/uploads");
    return Promise.resolve(
      Response.json({
        data: {
          id: "session",
          mode: "direct",
          size: body.size,
          upload: { method: "PUT", url: "https://storage.test/file" },
        },
      })
    );
  };
  const modules = {
    "@/config/env": { config: { API_BASE_URL: "https://api.test/api/v1" } },
    "@/services/api": {
      filesApi: {
        update: (uid, body) => {
          links.push({ body, uid });
        },
      },
    },
    "@life-palette/media": {
      analyzeMedia: (file, options) => {
        analyzedFiles.push(file);
        assert.equal(options.colorCount, 5);
        assert.equal(options.includeRawExif, true);
        options.onProgress({ percent: 100, stage: "md5" });
        options.onProgress({ percent: 0, stage: "decode" });
        options.onProgress({ percent: 100, stage: "analyze" });
        return {
          basic: {
            md5: "checksum",
            name: file.name,
            size: file.size,
            type: file.type,
          },
          ...(file.type.startsWith("video/")
            ? { video: { exif: { ...exif } } }
            : {
                image: {
                  colors: [{ hex: "#ff0000", is_primary: true }],
                  exif: { ...exif },
                },
              }),
          schema_version: 1,
        };
      },
    },
    "@life-palette/uploader/web": {
      compressImage: (file, options) => {
        assert.equal(options.maxSizeMB, 1);
        options.onProgress(100);
        return new File(["ab"], file.name, { type: file.type });
      },
      createUploader: (config) =>
        createUploader({
          ...config,
          fetch,
          getToken: () => null,
          partRetries: 0,
        }),
      detectLivePhotoPairs,
    },
  };
  const exports = {};
  // Compile the app facade in isolation while exercising the real V2 transport.
  new Function("require", "exports", outputText)((name) => {
    assert.ok(name in modules, `Unexpected import ${name}`);
    return modules[name];
  }, exports);
  return { ...exports, analyzedFiles, links, requests };
}

test("media upload uses V2 contract, preserves GPS/privacy and monotonic progress", async () => {
  const api = setup();
  const progress = [];
  const file = new File(["abc"], "photo.jpg", { type: "image/jpeg" });
  const result = await api.uploadMedia(file, {
    isPrivate: true,
    location: { lat: 12, lng: 34 },
    onProgress: (value) => progress.push(value.percent),
  });
  assert.equal(result.uid, "file-uid");
  assert.deepEqual(
    api.requests.map(({ url, method }) => [url, method]),
    [
      ["https://api.test/api/v1/uploads", "POST"],
      ["https://storage.test/file", "PUT"],
      ["https://api.test/api/v1/uploads/session/complete", "POST"],
    ]
  );
  assert.deepEqual(api.requests[0].body, {
    checksum: "checksum",
    file_name: "photo.jpg",
    size: 3,
  });
  const complete = api.requests[2].body;
  assert.equal(complete.is_private, true);
  assert.equal(complete.metadata.image.exif.lat, 12);
  assert.equal(complete.metadata.image.exif.lng, 34);
  assert.equal(complete.metadata.image.exif.device_make, "camera");
  assert.equal(complete.metadata.image.colors[0].hex, "#ff0000");
  assert.equal(progress.at(-1), 100);
  assert.deepEqual(
    progress,
    [...progress].sort((a, b) => a - b)
  );
});

test("storage failure propagates without completing a failed upload", async () => {
  const api = setup({ failUpload: true });
  await assert.rejects(
    api.uploadMedia(new File(["abc"], "photo.jpg", { type: "image/jpeg" })),
    STORAGE_FAILURE
  );
  assert.equal(api.requests.length, 2);
});

test("compression runs before analysis and initialization uses compressed bytes", async () => {
  const api = setup();
  const progress = [];
  await api.uploadMedia(
    new File(["abc"], "photo.jpg", { type: "image/jpeg" }),
    {
      ...api.DEFAULT_UPLOAD_OPTIONS,
      onProgress: (value) => progress.push(value.percent),
    }
  );
  assert.equal(api.analyzedFiles[0].size, 2);
  assert.equal(api.requests[0].body.size, 2);
  assert.deepEqual(
    api.requests[1].body,
    await api.analyzedFiles[0].arrayBuffer()
  );
  assert.equal(api.requests[2].body.metadata.basic.size, 2);
  assert.deepEqual(
    progress,
    [...progress].sort((a, b) => a - b)
  );
});

test("empty, incomplete and invalid locations preserve analyzed image and video GPS", async (t) => {
  const exif = { device_make: "camera", lat: 31.2, lng: 121.5 };
  const checks = [];
  const locations = [
    ["omitted", undefined],
    ["empty", {}],
    ["undefined coordinates", { lat: undefined, lng: undefined }],
    ["latitude only", { lat: 12 }],
    ["longitude only", { lng: 34 }],
    ["undefined longitude", { lat: 12, lng: undefined }],
    ["NaN latitude", { lat: Number.NaN, lng: 34 }],
    ["infinite longitude", { lat: 12, lng: Number.POSITIVE_INFINITY }],
    ["latitude out of range", { lat: -91, lng: 34 }],
    ["longitude out of range", { lat: 12, lng: 181 }],
    ["numeric strings", { lat: "12", lng: "34" }],
  ];

  for (const [name, type, kind] of [
    ["photo.jpg", "image/jpeg", "image"],
    ["video.mp4", "video/mp4", "video"],
  ]) {
    for (const [label, location] of locations) {
      checks.push(
        t.test(`${kind}: ${label}`, async () => {
          const api = setup({ exif });
          await api.uploadMedia(new File(["abc"], name, { type }), {
            location,
          });
          const complete = api.requests.find(({ url }) =>
            url.endsWith("/complete")
          );
          assert.deepEqual(complete.body.metadata[kind].exif, exif);
        })
      );
    }
  }
  await Promise.all(checks);
});

test("valid manual locations replace analyzed image and video GPS, including zero", async (t) => {
  const exif = { device_make: "camera", lat: 31.2, lng: 121.5 };
  const checks = [];
  for (const [name, type, kind] of [
    ["photo.jpg", "image/jpeg", "image"],
    ["video.mp4", "video/mp4", "video"],
  ]) {
    for (const location of [
      { lat: 12, lng: 34 },
      { lat: 0, lng: 0 },
      { lat: 90, lng: -180 },
    ]) {
      checks.push(
        t.test(`${kind}: ${location.lat}, ${location.lng}`, async () => {
          const api = setup({ exif });
          await api.uploadMedia(new File(["abc"], name, { type }), {
            location,
          });
          const complete = api.requests.find(({ url }) =>
            url.endsWith("/complete")
          );
          assert.deepEqual(complete.body.metadata[kind].exif, {
            ...exif,
            ...location,
          });
        })
      );
    }
  }
  await Promise.all(checks);
});

test("live photos link persisted image and video UIDs without old upload endpoints", async () => {
  const api = setup();
  await api.linkLivePhotoPairs([
    { name: "IMG_001.HEIC", type: "image/heic", uid: "image-uid" },
    { name: "IMG_001.MOV", type: "video/quicktime", uid: "video-uid" },
  ]);
  assert.deepEqual(api.links, [
    { body: { live_photo_video_sec_uid: "video-uid" }, uid: "image-uid" },
  ]);
});
