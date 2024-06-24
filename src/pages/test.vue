<script setup lang="ts">
const testRef = ref(null)
const imgObj = ref({
  preSrc: `http://nest-js.oss-accelerate.aliyuncs.com/nestTest/1/1711965193523.JPEG?x-oss-process=image/resize,l_50`,
  src: 'http://nest-js.oss-accelerate.aliyuncs.com/nestTest/1/1711965193523.JPEG',
  videoSrc:
		'http://nest-js.oss-accelerate.aliyuncs.com/nestTest/1/1711965199299.MOV',
})
const tt = {
  src: 'http://nest-js.oss-accelerate.aliyuncs.com/nestTest/1/1711984435093.JPEG',
  fileType: 'IMAGE',
  videoSrc:
		'http://nest-js.oss-accelerate.aliyuncs.com/nestTest/1/1711983844393.MOV',
  preSrc:
		'http://nest-js.oss-accelerate.aliyuncs.com/nestTest/1/1711984435093.JPEG?x-oss-process=image/resize,l_500',
}
onMounted(async () => {
  // await nextTick()
  // const player = LivePhotosKit.Player(testRef.value)
  // console.log('🍧-----player-----', player)
  // player.photoSrc =
  // 	'http://nest-js.oss-accelerate.aliyuncs.com/nestTest/1/1711965193523.JPEG'
  // player.videoSrc =
  // 	'http://nest-js.oss-accelerate.aliyuncs.com/nestTest/1/1711965199299.MOV'
  // // 当玩家获得刚够视频帧，并获得足够迅速流畅播放
  // player.addEventListener('canplay', (ev) => {
  // 	console.log(ev, '成功')
  // })
  // // 加载 Live Photo 的照片或视频组件失败时
  // player.addEventListener('error', (ev) => {
  // 	console.log('🌈-----ev-----', ev)
  // 	if (typeof ev.detail.errorCode === 'number') {
  // 		switch (ev.detail.errorCode) {
  // 			case LivePhotosKit.Errors.PHOTO_FAILED_TO_LOAD:
  // 				// Do something  图片组件加载失败
  // 				break
  // 			case LivePhotosKit.Errors.VIDEO_FAILED_TO_LOAD:
  // 				// Do something  视频组件加载失败
  // 				break
  // 		}
  // 	} else {
  // 		// Extract error.
  // 		console.error(ev.detail.error)
  // 	}
  // })
  // // Live照片的回放已经完成
  // player.addEventListener('ended', (ev) => {
  // 	console.log(ev, '完成')
  // })
  // player.play()
})
</script>

<template>
  <div class="box">
    <div class="h-100 w-100">
      <LazyImg
        :pre-src="imgObj.preSrc"
        :src="imgObj.src"
        :video-src="imgObj.videoSrc"
      />
    </div>
    <!-- <div ref="testRef" class="h-100 w-100"></div> -->
  </div>
</template>

<route lang="json">
{
	"meta": {
		"title": "Test",
		"layout": "noCom"
	}
}
</route>
