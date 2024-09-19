<script setup lang="ts">
import type { CSSProperties } from 'vue'
import type { ICardItem, IColumnQueue, IItemRect, IRenderItem, IVirtualWaterFallProps } from './type'
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { debounce, rafThrottle } from './tool'

const props = defineProps<IVirtualWaterFallProps>()

defineSlots<{
  item: (props: { item: ICardItem }) => any
}>()

const containerRef = ref<HTMLDivElement | null>(null)

const resizeObserver = new ResizeObserver(() => {
  handleResize()
})

const dataState = reactive({
  loading: false,
  isFinish: false,
  currentPage: 1,
  list: [] as ICardItem[],
})

const scrollState = reactive({
  viewWidth: 0,
  viewHeight: 0,
  start: 0,
})

const queueState = reactive({
  queue: new Array(props.column).fill(0).map<IColumnQueue>(() => ({ list: [], height: 0 })),
  len: 0,
})

const itemSizeInfo = computed(() =>
  dataState.list.reduce<Map<ICardItem['id'], IItemRect>>((pre, current) => {
    const itemWidth = Math.floor((scrollState.viewWidth - (props.column - 1) * props.gap) / props.column)
    pre.set(current.id, {
      width: itemWidth,
      height: Math.floor((itemWidth * current.height) / current.width),
    })
    return pre
  }, new Map()),
)

const end = computed(() => scrollState.viewHeight + scrollState.start)

const cardList = computed(() => queueState.queue.reduce<IRenderItem[]>((pre, { list }) => pre.concat(list), []))

const renderList = computed(() => cardList.value.filter(i => i.h + i.y > scrollState.start && i.y < end.value))

const computedHeight = computed(() => {
  let minIndex = 0
  let minHeight = Infinity
  let maxHeight = -Infinity
  queueState.queue.forEach(({ height }, index) => {
    if (height < minHeight) {
      minHeight = height
      minIndex = index
    }
    if (height > maxHeight) {
      maxHeight = height
    }
  })
  return {
    minIndex,
    minHeight,
    maxHeight,
  }
})

const listStyle = computed(() => ({ height: `${computedHeight.value.maxHeight}px` } as CSSProperties))

watch(
  () => props.column,
  () => {
    handleResize()
  },
)

function addInQueue(size = props.pageSize) {
  for (let i = 0; i < size; i++) {
    const minIndex = computedHeight.value.minIndex
    const currentColumn = queueState.queue[minIndex]
    const before = currentColumn.list[currentColumn.list.length - 1] || null
    const dataItem = dataState.list[queueState.len]
    const item = generatorItem(dataItem, before, minIndex)
    currentColumn.list.push(item)
    currentColumn.height += item.h
    queueState.len++
  }
}

function generatorItem(item: ICardItem, before: IRenderItem | null, index: number): IRenderItem {
  const rect = itemSizeInfo.value.get(item.id)
  const width = rect!.width
  const height = rect!.height
  let y = 0
  if (before)
    y = before.y + before.h + props.gap

  return {
    item,
    y,
    h: height,
    style: {
      width: `${width}px`,
      height: `${height}px`,
      transform: `translate3d(${index === 0 ? 0 : (width + props.gap) * index}px, ${y}px, 0)`,
    },
  }
}

async function loadDataList() {
  if (dataState.isFinish)
    return
  dataState.loading = true
  const list = await props.request(dataState.currentPage++, props.pageSize)
  if (!list.length) {
    dataState.isFinish = true
    return
  }
  dataState.list.push(...list)
  dataState.loading = false
  return list.length
}

const handleScroll = rafThrottle(() => {
  const { scrollTop, clientHeight } = containerRef.value!
  scrollState.start = scrollTop
  if (scrollTop + clientHeight > computedHeight.value.minHeight) {
    !dataState.loading
    && loadDataList().then((len) => {
      len && addInQueue(len)
    })
  }
})

const handleResize = debounce(() => {
  initScrollState()
  reComputedQueue()
}, 300)

function reComputedQueue() {
  queueState.queue = new Array(props.column).fill(0).map<IColumnQueue>(() => ({ list: [], height: 0 }))
  queueState.len = 0
  addInQueue(dataState.list.length)
}

function initScrollState() {
  scrollState.viewWidth = containerRef.value!.clientWidth
  scrollState.viewHeight = containerRef.value!.clientHeight
  scrollState.start = containerRef.value!.scrollTop
}

async function init() {
  initScrollState()
  resizeObserver.observe(containerRef.value!)
  const len = await loadDataList()
  len && addInQueue(len)
}

onMounted(() => {
  init()
})

onUnmounted(() => {
  resizeObserver.unobserve(containerRef.value!)
})
</script>

<template>
  <div ref="containerRef" class="fs-virtual-waterfall-container" @scroll="handleScroll">
    <div class="fs-virtual-waterfall-list" :style="listStyle">
      <div v-for="{ item, style } in renderList" :key="item.id" class="fs-virtual-waterfall-item" :style="style">
        <slot name="item" :item="item" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.fs-virtual-waterfall {
  &-container {
    width: 100%;
    height: 100%;
    overflow-y: scroll;
    overflow-x: hidden;
  }
  &-list {
    position: relative;
    width: 100%;
  }
  &-item {
    position: absolute;
    top: 0;
    left: 0;
    box-sizing: border-box;
  }
}
</style>
