<script setup lang="ts">
import { getCover, getLngLat } from '@/utils/map'
import { customDestr } from '@iceywu/utils'
import MapboxLanguage from '@mapbox/mapbox-gl-language'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

interface Props {
	data: any
}
const { data = {} } = defineProps<Props>()
const exifData = computed(() => {
	return customDestr(data.exif, { customVal: {} }) || {}
})

let map: mapboxgl.Map | null

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
	map && map.setStyle(mapStyle.value)
}

// 初始化生命周期
onMounted(() => {
	nextTick(() => {
		const lnglat = getLngLat(exifData.value)
		basePos.value.center = lnglat
		// basicMapbox.value = document.querySelector('.map-temp-box')
		init()
	})
})

onUnmounted(() => {
	map!.remove()
})

const basicMapbox = ref<any>(null)

const basePos = ref<any>({
	center: [104.072325, 30.664893],
	zoom: 10,
	pitch: 0,
	bearing: 0,
})
const hasFly = ref(false)
function init() {
	mapboxgl.accessToken
		= 'pk.eyJ1IjoidnlrYXd6YXRpcyIsImEiOiJjbHJycm1lYXAwaGxhMmlvMWhwZTA3Zmg2In0.eo2EYOK6v0smB1IRunC8VA'
	map = new mapboxgl.Map({
		container: basicMapbox.value,
		style: mapStyle.value,
		...basePos.value,
	})
	map.addControl(new MapboxLanguage({ defaultLanguage: 'zh-Hans' }))
	// ### 添加导航控制条
	// map.addControl(new mapboxgl.NavigationControl(), 'top-left')
	map.on('style.load', () => {
		// if (hasFly.value)
		//   return
		// map.setFog({})
		// map.flyTo({
		//   ...end.value,
		//   duration: 2000,
		//   essential: true,
		// })
		// hasFly.value = true
	})
	map.on('load', () => {
		addMarker(basePos.value.center, data, true)
	})
}

// 传入坐标，添加标记
function addMarker(lnglat: number[] | any, data?: any, isSingle?: boolean) {
	const flagEl = document.createElement('div')
	flagEl.className = 'marker-flag z-998 i-meteocons-windsock text-6xl'
	map && new mapboxgl.Marker(flagEl).setLngLat(lnglat).addTo(map)

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
		// dot.addEventListener('click', () => {
		//   addPop(lnglat, data, isSingle)
		// })
	}
}
// 重新设置marker
function resetMarker() {
	const lnglat = getLngLat(customDestr(data.exif, { customVal: {} }) || {})

	basePos.value.center = lnglat
	map && map.remove()

	init()
}
defineExpose({
	resetMarker,
})
</script>

<template>
	<!-- {{ data }} -->
	<div ref="basicMapbox" class="w-full relative h-full map-temp-box" />
</template>

<style>
.map-temp-box {
	/* transform: translateY(-100px);
	padding-bottom: 100px;
	height: calc(100vh + 100px); */
	/* height: fit-content; */
	/* height集成父级 */
	/* height: 100%; */
}
.mapboxgl-ctrl-bottom-left,
.mapboxgl-ctrl-bottom-right {
	display: none;
}

.mapboxgl-ctrl-icon {
	box-sizing: border-box;
}
.marker-dot {
	height: 20px;
	width: 20px;
	border-radius: 50%;
	overflow: hidden;
	background-repeat: no-repeat;
	background-size: 100% 100%;

	position: absolute;
	top: 0px;
	left: 0px;
	border: 2px solid white;
	cursor: pointer;
	z-index: 999;
}
</style>
