<script setup lang="ts">
import { topicFindAll } from '@/api/topic'
import MapPop from '@/components/Mappop.vue'
import { requestTo } from '@/utils/http/tool'
import { customDestr } from '@iceywu/utils'
import MapboxLanguage from '@mapbox/mapbox-gl-language'
import mapboxgl from 'mapbox-gl'
import { createVNode, render } from 'vue'

import 'mapbox-gl/dist/mapbox-gl.css'

const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)

let map: mapboxgl.Map | null
const tbRef: any = null

// const colorList = []

const isDark = useDark({
  onChanged() {
    nextTick(() => {
      if (map)
        setMapStyle()
    })
  },
})
const mapStyle = computed(() => {
  const mode = isDark.value ? 'dark' : 'light'
  return `mapbox://styles/mapbox/${mode}-v11`
})

function setMapStyle() {
  map.setStyle(mapStyle.value)
}

// 🌈 接口数据请求
const dataList = ref<any>([])
const getDataLoading = ref(false)
async function getData() {
  if (getDataLoading.value)
    return
  getDataLoading.value = true
  const params = {
    page: 1,
    size: 100,
		userId: userInfo.value?.id,
    // exif: true,
  }
  // const API = `${params.baseApi}/api/topic?page=${params.page}&size=${params.size}&sort=desc,createdAt&userId=${params.userId}&exif=${params.exif}`
  // const [err, res] = await to($fetch<any>(API))
  // if (res) {
  //   const { code, result = [] } = res || {}
  //   if (code === 200 && result) {
  //     const { data = [] } = result
  //     dataList.value = data

  //     getImgsInfo()
  //   }
  // }
  // if (err)
  //   getDataLoading.value = false
	const res = (await requestTo(topicFindAll(params)))[1] || {}

	dataList.value = res.data || []
	getImgsInfo()
  getDataLoading.value = false
}
function parseDMS(dms: string) {
  const dmsPattern = /(-?\d+)deg (\d+)' (-?\d+\.\d+)"/
  const match = dms.match(dmsPattern)

  if (match) {
    const degrees = Number.parseInt(match[1], 10)
    const minutes = Number.parseInt(match[2], 10)
    const seconds = Number.parseFloat(match[3])

    const decimalDegrees = degrees + minutes / 60 + seconds / 3600

    return decimalDegrees
  }
  else {
    // throw new Error('Invalid DMS format')
    return 0
  }
}
function getImgsInfo() {
  dataList.value.forEach((item: any) => {
    item.files.forEach((file: any) => {
      const exifInfo = customDestr(file.exif, { customVal: {} }) || {}
      file.exif = exifInfo || {}

      const { GPSLatitude, GPSLongitude, GPSLatitudeRef, GPSLongitudeRef }
        = exifInfo as any
      if (GPSLatitude?.value && GPSLongitude?.value) {
        let lat = parseDMS(GPSLatitude.value)
        let lng = parseDMS(GPSLongitude.value)
        const latRef = GPSLatitudeRef
        const lngRef = GPSLongitudeRef
        if (latRef === 'S') {
          lat = -lat
        }
        if (lngRef === 'W') {
          lng = -lng
        }
        file.lat = lat
        file.lng = lng

        addMarker([lng, lat], file, true)
      }
    })
  })
}

// 初始化生命周期
onMounted(() => {
  init()
  addMarkers()
})
async function addMarkers() {
  await getData()

  for (let index = 0; index < dataList.value.length; index++) {
    const element = dataList.value[index]
    const { extraData } = element || {}
    if (extraData) {
      const { gps_data } = JSON.parse(extraData)

      addMarker([gps_data?.lng, gps_data?.lat], element)
    }
  }
}
function clearCache() {
	if ('caches' in window) {
        caches.keys().then((cacheNames) => {
          cacheNames.forEach((cacheName) => {
            caches.delete(cacheName)
          })
        })
      }
}

onUnmounted(() => {
  map!.remove()
	// 清除cache storage
	clearCache()
})

const basicMapbox = ref<any>(null)
const start = ref<any>({
  center: [80, 80],
  zoom: 1,
  pitch: 75,
  bearing: 0,
})
const end = ref<any>({
  center: [104.072325, 30.664893],
  zoom: 10,
  // bearing: 20, //目标方位角
  // pitch: 75,
  pitch: 0,
})
const hasFly = ref(false)
function init() {
  mapboxgl.accessToken
    = 'pk.eyJ1IjoidnlrYXd6YXRpcyIsImEiOiJjbHJycm1lYXAwaGxhMmlvMWhwZTA3Zmg2In0.eo2EYOK6v0smB1IRunC8VA'
  map = new mapboxgl.Map({
    container: basicMapbox.value,
    style: mapStyle.value,
    ...start.value,
    minZoom: 1,
    maxZoom: 17,
		// maxTileCacheSize: 50, // 限制缓存的瓦片数量
  })
  map.addControl(new MapboxLanguage({ defaultLanguage: 'zh-Hans' }))
  // ### 添加导航控制条
  // map.addControl(new mapboxgl.NavigationControl(), 'top-left')
  map.on('style.load', () => {
    if (hasFly.value)
      return
    map.setFog({})
    map.flyTo({
      ...end.value,
      duration: 2000,
      essential: true,
    })
    hasFly.value = true
  })
  map.on('load', () => {

  })
  // 点击增加弹窗
  // map.on("click", (e: any) => {

  //   // addPop([e.lngLat.lng, e.lngLat.lat])
  //   // drawCircle([e.lngLat.lng, e.lngLat.lat])
  // });
}
function getCover(data: any) {
  const fileTemp = data || {}
  const { fileType, file, cover } = fileTemp || {}
  if (fileType === 'IMAGE') {
    let preSrc = `${file}?x-oss-process=image/resize,l_50`
    let src = file
    const fileSuffix = file.substring(file.lastIndexOf('.'))
    if (fileSuffix.toUpperCase() === '.HEIC') {
      preSrc = `${file}?x-oss-process=image/resize,l_50/format,jpg`
      src = `${file}?x-oss-process=image/format,jpg`
    }
    return {
      src,
      preSrc,
    }
  }
  else if (fileType === 'VIDEO') {
    const srcT
      = cover
      || `${file}?x-oss-process=video/snapshot,t_7000,f_jpg,w_0,h_0,m_fast`
    return {
      src: srcT,
      preSrc: srcT,
    }
  }
}
// const popIsOpen = ref(false);
// 传入坐标，添加标记
function addMarker(lnglat: number[] | any, data?: any, isSingle?: boolean) {
  const flagEl = document.createElement('div')
  flagEl.className = 'marker-flag z-998 i-meteocons-windsock text-6xl'
  new mapboxgl.Marker(flagEl).setLngLat(lnglat).addTo(map)

  // cover
  if (data) {
    let cover = {}
    const dot = document.createElement('div')
    if (isSingle) {
      const { id } = data

      cover = getCover(data) || {}

      dot.className = `marker-dot-${id} marker-dot`
    }
    else {
      const { files, id } = data

      const firstFile = files[0] || {}
      cover = getCover(firstFile) || {}

      dot.className = `marker-dot-${id} marker-dot`
    }
    dot.style.backgroundImage = `url(${cover?.preSrc})`
    new mapboxgl.Marker(dot).setLngLat(lnglat).addTo(map)
    dot.addEventListener('click', () => {
      addPop(lnglat, data, isSingle)
    })
  }
}
// 传入坐标，添加弹窗pop
const popObj = ref()
function addPop(lnglat: number[] | any, data?: any, isSingle?: boolean) {
  if (!data)
    return

  if (popObj.value)
    popObj.value.remove()

  const el = document.createElement('div')
  el.id = 'markerId'
  el.style.width = `${32}px`
  el.style.height = `${32}px`
  const LngLat = lnglat
  const elpopup = document.createElement('div')
  const vNodePopup = createVNode(MapPop, {
    data,
    isSingle,
    onClosePop: () => {
      if (popObj.value)
        popObj.value.remove()
    },
  })
  render(vNodePopup, elpopup)

  const option = {
    closeOnClick: false,
    closeButton: false,
    anchor: 'bottom',
    offset: [0, -20],
  } as any

  const popups = new mapboxgl.Popup(option)
    .setLngLat(LngLat)
    .setMaxWidth('300px')
    .setDOMContent(elpopup)
    .addTo(map)
  popObj.value = popups
}
// 绘制圆形区域的函数
// const hasAddLayer = ref(false)
// function drawCircle(center: number[]) {
//   // const radius = 8477.70727135986 / 1000 // 半径
//   const radius = 8477.70727135986 / 100
//   const options = {
//     steps: 64,
//     units: 'kilometers',
//   } as any
//   const circle = turf_circle(center, radius, options)

//   if (hasAddLayer.value) {
//     // 修改addSource
//     map.getSource('circle').setData(circle)
//     return
//   }
//   else {
//     map.addSource('circle', {
//       type: 'geojson',
//       data: circle,
//     })
//   }
//   map.addLayer({
//     id: 'circleLine',
//     type: 'line',
//     source: 'circle',
//     paint: {
//       'line-color': '#000',
//       'line-width': 3,
//     },
//   })
//   hasAddLayer.value = true
// }
</script>

<template>
  <div ref="basicMapbox" class="w-full relative map-temp-box" />
</template>

<style>
.map-temp-box {
  /* transform: translateY(-100px); */
  /* padding-bottom: 100px;  */
  /* height: calc(100vh + 100px); */
	/* min-height: 30vh; */
	height: 100%;
}
.mapboxgl-ctrl-bottom-left,
.mapboxgl-ctrl-bottom-right {
  display: none;
}

.mapboxgl-ctrl-icon {
  box-sizing: border-box;
}
.marker-dot {
  /* background: red;
  border: 2px solid white;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  transform: translateX(-30px);
  position: absolute;
  top: 20px;
  left: -15px; */
  height: 40px;
  width: 40px;
  border-radius: 50%;
  overflow: hidden;
  background-repeat: no-repeat;
  background-size: 100% 100%;

  position: absolute;
  top: 20px;
  left: -15px;
  border: 2px solid white;
  cursor: pointer;
  z-index: 999;
}
</style>
