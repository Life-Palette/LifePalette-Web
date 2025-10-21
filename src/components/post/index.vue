<script setup>
import PostBase from '~/components/post/base.vue'

const props = defineProps({

	data: {
		type: Object,
		default: () => {},
	},
})
const dialogVisible = defineModel({ default: false })
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    class="no-dlg-bg-class"
    append-to-body
    title="Tips"
    width="600px"
    top="8vh"
    :z-index="99999"
    @close="dialogVisible = false"
  >
  <PostBase v-model:is-show-dialog="dialogVisible" :data />
  </el-dialog>
</template>
