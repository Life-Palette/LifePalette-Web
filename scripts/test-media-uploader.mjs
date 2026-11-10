import assert from "node:assert/strict";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { build } from "vite";

const bundle = await build({
  build: {
    lib: {
      entry: fileURLToPath(
        new URL("../src/components/media/media-uploader.tsx", import.meta.url)
      ),
      formats: ["cjs"],
    },
    rolldownOptions: {
      external: [
        "react",
        "react/jsx-runtime",
        "@dnd-kit/core",
        "@dnd-kit/sortable",
        "@dnd-kit/utilities",
        "live-photo",
        "lucide-react",
        "@/components/map/location-picker",
        "@/services/api",
        "@/services/upload",
        "@/utils/upload/gps-extractor",
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

function findElements(node, predicate) {
  if (Array.isArray(node)) {
    return node.flatMap((child) => findElements(child, predicate));
  }
  if (!node || typeof node !== "object") {
    return [];
  }
  return [
    ...(predicate(node) ? [node] : []),
    ...findElements(node.props?.children, predicate),
  ];
}

function setup() {
  const slots = [];
  const pendingGPS = new Map();
  const props = {
    initialImages: [],
    onChange: (items) => {
      latestItems = items;
    },
  };
  let cursor = 0;
  let dirty = true;
  let effects = [];
  let latestItems = [];
  let tree;

  // Run the actual component's handlers and effects without mounting preview children.
  const react = {
    createElement: (type, attributes, ...children) => ({
      props: { ...attributes, children },
      type,
    }),
    useCallback: (callback) => callback,
    useEffect: (effect, dependencies) => {
      const index = cursor;
      cursor += 1;
      const previous = slots[index];
      if (
        !previous ||
        dependencies.some((value, position) => value !== previous[position])
      ) {
        slots[index] = dependencies;
        effects.push(effect);
      }
    },
    useImperativeHandle: () => undefined,
    useRef: (initialValue) => {
      const index = cursor;
      cursor += 1;
      slots[index] ??= { current: initialValue };
      return slots[index];
    },
    useState: (initialValue) => {
      const index = cursor;
      cursor += 1;
      if (!(index in slots)) {
        slots[index] = initialValue;
      }
      return [
        slots[index],
        (value) => {
          slots[index] =
            typeof value === "function" ? value(slots[index]) : value;
          dirty = true;
        },
      ];
    },
  };
  const jsx = (type, attributes) => ({ props: attributes, type });
  const dndContext = () => undefined;
  const modules = {
    "@/components/map/location-picker": { LocationPicker: () => undefined },
    "@/services/api": { filesApi: { update: () => Promise.resolve() } },
    "@/services/upload": { detectLivePhotoPairs: () => [] },
    "@/utils/upload/gps-extractor": {
      extractGPSFromImage: (file) =>
        new Promise((resolve) => pendingGPS.set(file, resolve)),
    },
    "@dnd-kit/core": {
      closestCenter: () => undefined,
      DndContext: dndContext,
      KeyboardSensor: () => undefined,
      PointerSensor: () => undefined,
      useSensor: () => ({}),
      useSensors: () => [],
    },
    "@dnd-kit/sortable": {
      arrayMove: (items, from, to) => {
        const copy = [...items];
        copy.splice(to, 0, copy.splice(from, 1)[0]);
        return copy;
      },
      rectSortingStrategy: () => undefined,
      SortableContext: () => undefined,
      sortableKeyboardCoordinates: () => undefined,
      useSortable: () => ({}),
    },
    "@dnd-kit/utilities": { CSS: {} },
    "live-photo": { LivePhotoViewer: class {} },
    "lucide-react": {
      GripVertical: () => undefined,
      Image: () => undefined,
      MapPin: () => undefined,
      Video: () => undefined,
      X: () => undefined,
    },
    react: { ...react, default: react },
    "react/jsx-runtime": { Fragment: "fragment", jsx, jsxs: jsx },
  };
  const exports = {};
  new Function("require", "exports", outputText)((name) => {
    assert.ok(name in modules, `Unexpected import ${name}`);
    return modules[name];
  }, exports);

  function render() {
    let renders = 0;
    do {
      renders += 1;
      assert.ok(renders < 20, "Component did not settle");
      cursor = 0;
      dirty = false;
      effects = [];
      tree = exports.MediaUploader(props);
      for (const effect of effects) {
        effect();
      }
    } while (dirty);
  }

  function mediaElement(id) {
    const [element] = findElements(tree, (node) => node.props?.item?.id === id);
    assert.ok(element, `Missing media item ${id}`);
    return element;
  }

  render();
  return {
    add: (files) => {
      const [input] = findElements(
        tree,
        (node) => node.type === "input" && node.props.type === "file"
      );
      input.props.onChange({ target: { files } });
      render();
    },
    flush: async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
      render();
    },
    items: () => latestItems,
    locate: async (id, location) => {
      await mediaElement(id).props.onLocationAdd(id, location);
      render();
    },
    remove: (id) => {
      mediaElement(id).props.onRemove(id);
      render();
    },
    reorder: (from, to) => {
      const [context] = findElements(tree, (node) => node.type === dndContext);
      context.props.onDragEnd({ active: { id: from }, over: { id: to } });
      render();
    },
    resolveGPS: (file, location) => {
      assert.ok(
        pendingGPS.has(file),
        `GPS extraction did not start: ${file.name}`
      );
      pendingGPS.get(file)(location);
      pendingGPS.delete(file);
    },
  };
}

function photo(name) {
  return new File([name], name, { type: "image/jpeg" });
}

test("overlapping batches keep unique IDs and their own GPS when completed out of order", async (t) => {
  t.mock.method(Date, "now", () => 123);
  const picker = setup();
  const first = photo("first.jpg");
  const second = photo("second.jpg");
  picker.add([first]);
  picker.add([second]);
  assert.equal(new Set(picker.items().map(({ id }) => id)).size, 2);
  await picker.flush();

  picker.resolveGPS(second, { lat: 20, lng: 30 });
  await picker.flush();
  assert.equal(picker.items()[0].data.lat, undefined);
  assert.equal(picker.items()[1].data.lat, 20);

  picker.resolveGPS(first, { lat: 10, lng: 40 });
  await picker.flush();
  assert.deepEqual(
    picker.items().map(({ data }) => [data.file.name, data.lat, data.lng]),
    [
      ["first.jpg", 10, 40],
      ["second.jpg", 20, 30],
    ]
  );
});

test("GPS follows stable item IDs after reordering and removal", async () => {
  const picker = setup();
  const first = photo("first.jpg");
  const removed = photo("removed.jpg");
  const last = photo("last.jpg");
  picker.add([first, removed, last]);
  const [firstItem, removedItem, lastItem] = picker.items();
  await picker.flush();
  picker.reorder(firstItem.id, lastItem.id);
  picker.remove(removedItem.id);

  picker.resolveGPS(first, { lat: 10, lng: 11 });
  picker.resolveGPS(removed, { lat: 20, lng: 21 });
  picker.resolveGPS(last, { lat: 30, lng: 31 });
  await picker.flush();
  assert.deepEqual(
    picker.items().map(({ data }) => [data.file.name, data.lat, data.lng]),
    [
      ["last.jpg", 30, 31],
      ["first.jpg", 10, 11],
    ]
  );
});

test("late GPS and empty GPS preserve locations selected while extraction is pending", async () => {
  const picker = setup();
  const zero = photo("zero.jpg");
  const withoutGPS = photo("without-gps.jpg");
  picker.add([zero, withoutGPS]);
  const [zeroItem, withoutGPSItem] = picker.items();
  await picker.flush();
  await picker.locate(zeroItem.id, { lat: 0, lng: 0 });
  await picker.locate(withoutGPSItem.id, { lat: -12, lng: 34 });

  picker.resolveGPS(zero, { lat: 31, lng: 121 });
  picker.resolveGPS(withoutGPS, null);
  await picker.flush();
  assert.deepEqual(
    picker.items().map(({ data }) => [data.lat, data.lng]),
    [
      [0, 0],
      [-12, 34],
    ]
  );
});
