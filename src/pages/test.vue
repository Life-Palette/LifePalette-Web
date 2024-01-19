<script setup lang="ts">
import { createReusableTemplate } from '@vueuse/core'
import { encodeImageToBlurhash } from '~/utils/blurhash'
import ImgBlurHash from '~/components/ImgBlurHash'
// import ImgBlurHash from '~/components/ImgBlurHash'

const [DefineTemplate, ReuseTemplate] = createReusableTemplate<{
	test?: string
}>()

onMounted(async () => {
	console.log(
		'mounted',
		await encodeImageToBlurhash(
			'https://avatars.githubusercontent.com/u/66096254?v=4',
		),
	)
})

const coverUrl = {
	src: 'http://nest-js.oss-accelerate.aliyuncs.com/nestDev/_DSC0879.JPG',
	preSrc:
		'http://nest-js.oss-accelerate.aliyuncs.com/nestDev/_DSC0879.JPG?x-oss-process=image/resize,l_50',
}
</script>

<template>
	<div class="mb-1 overflow-hidden">
		<LazyImg
			height="400px"
			width="300px"
			:pre-src="coverUrl.preSrc"
			:src="coverUrl.src"
			:is-img-mode="true"
		></LazyImg>
	</div>
	<DefineTemplate v-slot="{ $slots }">
		<div class="flex gap-4">
			<component :is="$slots.default" />
			<component :is="$slots.aa" />
		</div>
	</DefineTemplate>

	<ReuseTemplate>
		<div>Some content</div>
	</ReuseTemplate>
	<ReuseTemplate>
		<div>Another content1</div>
	</ReuseTemplate>
	<ReuseTemplate test="asas">
		<div>
			<ImgBlurHash
				src="https://avatars.githubusercontent.com/u/66096254?v=4"
				blurhash="LYN0}600~q%LIT9Ft7IoIV-;-pxu"
				alt="Avatar"
				md="w-10 h-10"
				h-10
				w-10
				rounded-full
			/>
		</div>
		<template #aa>
			<div>aaaa</div>
		</template>
	</ReuseTemplate>
</template>

<route lang="json">
{
	"meta": {
		"title": "Test",
		"layout": "noCom"
	}
}
</route>
